# 주행 AI 모델 NPU 양자화 · 지식증류

## 개요

엣지 NPU에서 주행 모델을 돌리면 양자화 오차 때문에 예측 경로가 흔들리고, 이것이 그대로 조향 품질 저하로 이어집니다. 이 연구에서는 **보드 출력과 FP32 원본 사이의 오차를 원인부터 추적해 줄이고**, 더 큰 Teacher 모델의 지식을 경량 Student 모델로 옮기는 **지식증류 파이프라인**을 구축했습니다. 실차 데이터로 **조향 토크 예측 신경망(NNLC)**도 학습해 [edgepilot](project.html?project=edgepilot)에 적용했습니다.

<div class="highlights">
<div><h4>양자화 오차 최대 82% 감소</h4><p>오차 원인을 U16 Gelu 테이블 보간으로 특정했습니다. 혼합 정밀도, AdaRound, bias 보정을 적용해 2초 후 경로 오차를 70% 줄였습니다.</p></div>
<div><h4>보드와 일치하는 PC 에뮬레이터</h4><p>보드 출력과 cosine 0.9996으로 일치하는 onnxruntime 에뮬레이터를 만들어, 보드 없이도 양자화 효과를 평가할 수 있습니다.</p></div>
<div><h4>지식증류 · 실궤적 재라벨</h4><p>Teacher soft label과, 사람이 조향한 구간을 실제 주행 궤적으로 다시 라벨링한 데이터로 학습하는 실험 161건을 관리했습니다.</p></div>
<div><h4>조향 토크 신경망</h4><p>실차 7.8시간 데이터로 학습한 MLP 앙상블이 선형 모델보다 토크 예측 오차를 31% 줄였습니다.</p></div>
</div>

## 파이프라인

<figure class="fig"><div class="frame pad"><img src="assets/diagrams/distill-pipeline.svg" alt="주행 모델 지식증류 및 NPU 배포 파이프라인"></div><figcaption><b>FIG 1</b><span>데이터·라벨링 → 학습·증류 → 배포·검증의 3단계 파이프라인입니다. 실차 주행에서 다시 수집한 데이터를 학습에 되돌리는 DAgger 루프로 반복 개선하며, 회귀가 생기면 직전 배포 모델로 되돌립니다.</span></figcaption></figure>

## 양자화 정밀도 복원

<figure class="fig"><div class="frame"><img src="assets/img/distill/chart-quant-error.webp" alt="NPU 양자화 개선 전후 보드 출력 오차 감소율 그래프"></div><figcaption><b>FIG 2</b><span>FP32 대비 보드 출력 오차 감소율입니다. 보류해 둔 주행 504프레임을 closed loop로 측정했습니다. 경로·yaw·차선 위치 등 모든 주요 출력이 59–82% 개선됐습니다.</span></figcaption></figure>

| 출력 | 개선 전 | 개선 후 | 감소 |
|------|------|------|------|
| Plan 횡위치 (2 s) | 7.72 cm | 2.35 cm | −70% |
| Plan 횡위치 (4 s) | 26.5 cm | 10.3 cm | −61% |
| Yaw (0.5 s) | 2.36 mrad | 0.42 mrad | −82% |
| 차선 위치 | 13.2 cm | 3.33 cm | −75% |

- **원인 분석**: 레이어별로 FP32와 비교해, 오차 대부분이 U16 Gelu 활성 함수의 테이블 보간에서 생긴다는 것을 확인했습니다.
- **대책**: Gelu 2개만 FP32로 실행(연산 사이클 +6%)하고, AdaRound와 보정 데이터 재선정(633프레임), bias 보정을 함께 적용했습니다. 추론 시간은 오히려 10.39 ms에서 9.79 ms로 줄었습니다.

## 지식증류

- **Teacher**: 같은 계열의 대형 주행 모델이 만든 soft label을 씁니다. 보드와 똑같은 워프를 거친 입력을 사용해 학습과 추론 조건을 일치시켰습니다.
- **Student**: 배포 중인 모델을 PyTorch로 옮겨 미세 조정하고, 출력 손실과 중간 feature hint를 함께 학습합니다. 가중치 보간(WiSE-FT)으로 일반화 성능을 지킵니다.
- **실궤적 재라벨**: 사람이 조향한 구간(전체의 6.5%)은 Teacher 대신 바퀴 속도와 yaw rate를 적분한 **실제 주행 궤적**으로 라벨을 바꿨습니다.
- **결과**: 오프라인 평가에서 배포 모델 대비 2초 경로 오차 −38%, 4초 −23%를 얻었습니다. 실차 검증은 진행 중이며, 회귀가 확인된 후보는 배포하지 않고 이전 모델을 유지했습니다.

<figure class="fig"><div class="frame dark"><img src="assets/img/distill/model-input-fov.webp" alt="야간 주행 영상 위에 모델 입력 영역과 수평선을 표시한 화면"></div><figcaption><b>INPUT</b><span>야간 주행 영상 위에 모델 입력 창(road / wide)과 수평선을 겹쳐 그렸습니다. 카메라 보정이 모델 입력 정합에 미치는 영향을 분석할 때 썼습니다.</span></figcaption></figure>

## 조향 토크 신경망 (NNLC)

| 항목 | 내용 |
|------|------|
| 데이터 | 실차 26회 주행, 11.5 h (유효 7.8 h) |
| 모델 | MLP, 입력 33개, 3개 앙상블, 좌우 반전 증강 |
| 결과 | 교차검증 RMSE 0.0414 — 선형 모델(0.0604) 대비 −31% |
| 적용 | edgepilot 토크 제어 feed-forward (v3 / v4) |

## 기술 스택

PyTorch · ONNX · Pulsar2 (U16/S8, AdaRound) · onnxruntime · Knowledge Distillation · WiSE-FT · DAgger · NumPy / pandas
