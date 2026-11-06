# edgepilot — 초소형 NPU 보드 기반 차선 유지 보조 시스템

## 개요

**edgepilot**은 손바닥만 한 AI 카메라 보드 한 대(Sipeed MaixCAM2, Axera AX630C)에 **카메라, 주행 AI 모델, 조향 제어, HUD, 주행 기록**을 모두 올린 차선 유지 보조(LKA) 시스템입니다. 오픈소스 주행 보조 시스템 openpilot의 주행 모델(supercombo)과 횡방향 제어 로직을 NPU용으로 변환하고 C++17로 다시 구현했으며, **실제 차량(KIA K7 HEV)에서 약 860 km를 시험 주행**하며 검증했습니다.

고성능 PC나 전용 ADAS 하드웨어 없이 저전력 엣지 SoC만으로 카메라 입력부터 CAN 조향 명령까지 처리하는 것이 목표였고, 처음부터 끝까지 단독으로 개발했습니다.

<figure class="fig medium"><div class="frame dark"><img src="assets/img/edgepilot/drive-day.webp" alt="주간 고속 주행 중 차선 유지와 HUD 화면"></div><figcaption><b>DRIVE</b><span>주간 실차 주행 중 HUD 화면입니다. 모델이 예측한 주행 경로, 선행 차량, 시스템 상태, 학습된 조향 파라미터가 실시간으로 표시됩니다.</span></figcaption></figure>

<div class="highlights">
<div><h4>실시간 온디바이스 추론</h4><p>주행 모델이 NPU에서 프레임당 15.5 ms에 돌아가고, 모델 루프는 20 Hz로 동작합니다. 촬영부터 조향 명령까지 걸리는 시간은 73 ms 이내입니다.</p></div>
<div><h4>Zero-copy 영상 파이프라인</h4><p>ISP → 프레임 링 → GDC 워프 → NPU를 메모리 복사 없이 연결해, CPU 사용률을 SoC 전체의 약 1/5로 억제했습니다.</p></div>
<div><h4>Python 없는 C++17 제어 스택</h4><p>플래너, 횡 MPC, 토크 제어, 온라인 보정·학습기를 C++로 다시 구현하고 호스트 테스트 320개로 검증했습니다.</p></div>
<div><h4>실차 검증</h4><p>녹화 주행 46회, 약 860 km를 시험했습니다. 요청 곡률과 실제 곡률의 상관계수는 0.98, 운전자 개입률은 1.5%였습니다.</p></div>
</div>

## 시스템 구조

<figure class="fig"><div class="frame pad"><img src="assets/diagrams/edgepilot-architecture.svg" alt="edgepilot 시스템 구조와 지연 시간 예산"></div><figcaption><b>FIG 1</b><span>시스템 구조와 지연 시간 예산. 카메라 프레임은 공유 메모리 링을 통해 복사 없이 GDC 워프와 NPU로 전달됩니다. 제어 루프는 100 Hz로 Panda를 거쳐 차량 CAN에 조향 명령을 보냅니다.</span></figcaption></figure>

| 구분 | 사양 |
|------|------|
| SoC | Axera AX630C — Cortex-A53 ×2, NPU ×2, 1 GB (Sipeed MaixCAM2) |
| 카메라 | OS04D10, ISP + AI-ISP(NPU0), NV12 1280×720 |
| 주행 모델 | openpilot supercombo, U16/S8 양자화 33 MB, NPU1에서 15.5 ms |
| 제어 | controlsd 100 Hz — 플래너, 자체 횡 MPC 솔버, 토크 제어 |
| 차량 연동 | Panda (USB-C), CAN 버스 3개, LKAS11 · MDPS12 100 Hz |
| 출력 | 640×480 LCD HUD, H.264 주행 기록 + 이벤트 로그, 웹 콘솔 |

## 핵심 기술

### 1. NPU용 주행 모델 변환
- openpilot 주행 모델을 ONNX로 내보낸 뒤, NPU 컴파일러가 지원하지 않는 연산을 **수치상 같은 연산으로 바꿔** U16/S8로 양자화했습니다.
- 출력 head 13개를 15개 출력으로 나눠 양자화 해상도를 확보했습니다. 그 결과 고유 yaw 값이 12개에서 568개로 늘었고, 횡가속 오차는 절반으로 줄었습니다.
- 보정 데이터에 차선 변경 의도(desire) 신호를 넣어, 양자화 뒤 사라졌던 차선 변경 출력(0.00 → 0.99)을 되살렸습니다.

### 2. 하드웨어 엔진을 최대한 쓰는 영상 경로
- ISP 출력은 CMM 프레임 링(8슬롯)에 한 번만 저장하고, 모델 입력용 512×256 뷰 2개는 **GDC 하드웨어 워프**로 약 1 ms에 만듭니다. CPU로 워프한 결과와 Y 채널 차이는 1 LSB 이하입니다.
- 같은 프레임을 IVPS로 나눠 LCD HUD와 H.264 녹화에 쓰므로, 모델 추론과 화면 출력이 서로 영향을 주지 않습니다.

### 3. 제어와 안전
- 플래너와 횡 MPC를 C++로 다시 구현했고, 온라인 조향비·오프셋·지연 추정기(paramsd·torqued·lagd)도 포팅했습니다.
- **4단계 안전 구조**: 상태 게이트(모델·MPC·CAN·기어·벨트) → 곡률·저크·토크 변화율 제한 → 송신 스위치(섀도 모드) → Panda 안전 펌웨어
- 급커브에서 조향 한계를 넘으면 운전자에게 개입을 요청하고, 운전자가 핸들을 잡으면 조향을 일시정지했다가 놓으면 재개합니다. 고장을 감지하면 조향 토크를 단계적으로 줄이며 해제합니다.

<figure class="fig"><div class="frame dark"><img src="assets/img/edgepilot/hud-states.webp" alt="HUD 6가지 상태: 정상, 차선 변경, 오토홀드, 개입 요청, 조향 일시정지, 조향 고장"></div><figcaption><b>HUD</b><span>HUD 상태 표시. 정상 주행, 차선 변경 안내, 정차 유지(AUTO HOLD), 개입 요청, 조향 일시정지, 고장 경고를 운전자가 한눈에 알아볼 수 있도록 디자인했습니다.</span></figcaption></figure>

## 실차 검증

<figure class="fig"><div class="frame"><img src="assets/img/edgepilot/chart-curvature.webp" alt="실차 차선 유지 1분 구간의 요청 곡률과 실제 곡률 비교 그래프"></div><figcaption><b>FIG 2</b><span>실차 차선 유지 1분 구간(41–66 km/h)입니다. 제어기가 요청한 곡률과 조향각·요레이트로 계산한 실제 곡률의 상관계수는 0.98입니다.</span></figcaption></figure>

<figure class="fig"><div class="frame"><img src="assets/img/edgepilot/chart-road-km.webp" alt="실차 시험 누적 주행 거리 그래프"></div><figcaption><b>FIG 3</b><span>누적 실차 시험 거리. 녹화된 46회 주행의 이벤트 로그에서 차속을 적분해 구했으며, 약 859 km 중 852 km를 조향 보조가 켜진 상태로 달렸습니다.</span></figcaption></figure>

<figure class="fig medium"><div class="frame dark"><img src="assets/img/edgepilot/drive-night.webp" alt="야간 고속 주행 중 차선 유지 화면"></div><figcaption><b>NIGHT</b><span>야간 고가 하부 구간에서 시속 약 77 km로 주행하며 차선을 유지하는 장면입니다.</span></figcaption></figure>

## 개발 규모

| 항목 | 내용 |
|------|------|
| 기간 | 2026.05 – 진행 중 (K230 버전 → 2026.09 MaixCAM2 이전) |
| 커밋 · 릴리스 | 299 commits, v0.0.1 – v0.0.9 |
| 코드 | C++ 런타임 약 25.6k lines, 테스트 약 14k lines, 호스트 테스트 320개 |
| 카메라 보정 | 재투영 오차 0.52 px RMS |
| 부팅 | 전원 인가 후 약 33초 만에 첫 모델 출력 |

## 기술 스택

C++17 · Embedded Linux · AX630C NPU · Pulsar2 · ONNX · openpilot · Panda / CAN · MPC · GDC / IVPS · H.264 · googletest

## 의의

이 프로젝트는 **손바닥 크기의 보급형 엣지 AI 보드로도 실제 도로에서 동작하는 주행 보조 시스템을 만들 수 있다**는 것을 직접 보여줍니다. 모델 변환·양자화, 하드웨어 영상 경로, 실시간 제어, 차량 CAN 연동, 안전 설계까지 온디바이스 AI 제품에 필요한 전 과정을 다뤘습니다. 이 경험은 산업 현장의 비전 장비나 로봇 같은 다른 엣지 AI 제품 개발에도 그대로 적용할 수 있습니다.

> 연구·개발 목적의 개인 프로젝트이며, 시험 주행은 운전자가 항상 조향에 개입할 수 있는 상태에서 진행했습니다.
