# 주행 모델 멀티 플랫폼 포팅

## 개요

같은 주행 AI 모델을 성격이 전혀 다른 4종의 엣지 플랫폼, 즉 **RISC-V(K230), Rockchip NPU(RK3588), ARM CPU(Raspberry Pi 4), Axera NPU(AX630C)**에 이식해 모두 **20 Hz(프레임당 50 ms) 실시간 예산 안에서** 돌렸습니다. 플랫폼마다 추론 런타임, 정밀도, 영상 전처리 가속 방법이 다르기 때문에, 이 과정이 곧 각 SoC의 성능을 끝까지 끌어내는 연습이었습니다.

<figure class="fig"><div class="frame"><img src="assets/img/porting/chart-latency.webp" alt="플랫폼별 주행 모델 추론 시간 비교 그래프"></div><figcaption><b>FIG 1</b><span>플랫폼별 주행 모델 1프레임 추론 시간을 보드에서 실측한 평균값입니다. 플랫폼마다 모델 버전과 정밀도가 달라 단순 성능 비교용은 아니며, 모두 20 Hz 예산(50 ms) 안에 들어옵니다.</span></figcaption></figure>

## 플랫폼별 결과

| 플랫폼 | 런타임 · 정밀도 | 추론 | 주요 작업 |
|------|------|------|------|
| **Axera AX630C** (MaixCAM2) | Pulsar2 · U16/S8 | **15.5 ms** | GDC 하드웨어 워프, zero-copy 파이프라인 → [edgepilot](project.html?project=edgepilot) |
| **Kendryte K230** (RISC-V) | nncase · int16 | **27.7 ms** | VGLite GPU 워프, 자체 MPC 솔버(약 30배 가속), 커스텀 Linux 이미지 |
| **Rockchip RK3588** | RKNN 3코어 · FP16 | **34.8 ms** | OpenCL 워프, 10분 연속 20 FPS · 프레임 드롭 0 |
| **Raspberry Pi 4** | ncnn · BF16 (CPU) | **49.3 ms** | 모델 수술(입력 경로 축소)로 82.2 → 49.3 ms, 12 → 20 fps |

## 주요 기술 포인트

- **K230 (RISC-V)**: openpilot 전체를 riscv64로 포팅하고, 보드 SDK의 디스플레이, 메모리, USB 호스트 문제를 직접 고쳐 실차 시험용 Linux 이미지를 만들었습니다. 양자화 후 주행 경로 가설 일치율은 94.5%, FP32 대비 2초 횡 오차는 0.020 m입니다.
- **RK3588**: NPU 3코어를 모두 쓰는 RKNN 변환에 OpenCL 기반 워프를 붙여, 10분 연속 실행 동안 프레임 주기 50.000 ms를 유지했습니다. 차량 내 디스플레이로 쓴 SPI LCD 드라이버도 따로 브링업했습니다([Lab](project.html?project=lab-rk3588-lcd)).
- **Raspberry Pi 4**: NPU 없이 CPU만으로 20 fps를 내기 위해 모델의 큰 입력 경로를 제거하고(Gemm 2048 → 1024열) ncnn BF16으로 최적화했습니다.
- **차량 지원**: 오픈소스 차량 인터페이스(opendbc, panda)에 KIA K7 HEV 지원을 직접 추가했습니다.

## 기간

2025.07 – 2026.09 · 실차 시험 데이터 18세트(K230) 포함

## 기술 스택

RISC-V · nncase / KPU · RKNN · OpenCL · ncnn · BF16 · VGLite · Buildroot · opendbc · panda
