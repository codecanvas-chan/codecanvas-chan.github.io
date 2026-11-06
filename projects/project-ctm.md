# 철도 차량 단말장치(CTM) 영상 모듈 개발

## 프로젝트 개요

철도 차량에 탑재되는 단말장치(CTM)에서 **차량 NVR에 녹화된 CCTV 영상을 조회·재생·내보내기** 하는 영상 모듈을 개발했습니다. NXP **i.MX8 QuadMax** 기반 Yocto 리눅스 위에서 Qt 5.15와 GStreamer로 구현했으며, 18대 카메라의 녹화 현황을 24시간 타임라인으로 보여주고 최대 4채널을 **같은 시각으로 맞춰 동시 재생**합니다.

요구사양 검토부터 매주 태그 릴리스, 정적 분석·문서화까지 철도 차량 납품 기준에 맞춰 진행했고, 착수 8주 만에 v1.0을 납품한 뒤 유지보수 개선을 이어갔습니다.

<div class="highlights">
<div><h4>4채널 HW 디코딩 동기 재생</h4><p>채널별 GStreamer 파이프라인에서 VPU HW 디코딩과 G2D 스케일링을 사용하고, 1 Hz 마스터 클럭으로 네 화면의 재생 시각을 맞춥니다.</p></div>
<div><h4>NVR FTP 무중단 스트리밍</h4><p>현재 1분 세그먼트를 받으면 바로 재생하고, 다음 파일은 Prefetch해 끊김 없이 이어서 재생합니다.</p></div>
<div><h4>18카메라 이벤트 타임라인</h4><p>4개 차종, 18대 카메라, 5종 이벤트의 녹화 구간을 한 화면에 보여줍니다. 화재 등 이벤트 구간은 적색으로 표시하고 4단계로 확대할 수 있습니다.</p></div>
<div><h4>철도 납품 품질 기준</h4><p>MISRA C/C++ 룰셋을 적용하고 Doxygen 주석률 40% 이상(요구 35%)을 맞췄습니다. 매주 태그 릴리스로 진행 상황을 공유했습니다.</p></div>
</div>

## 시스템 구성

<figure class="fig"><div class="frame pad"><img src="assets/diagrams/ctm-architecture.svg" alt="CTM 영상 모듈 시스템 구성도"></div><figcaption><b>FIG 1</b><span>시스템 구성. 화면은 UI 계층, FTP 조회·다운로드와 스토리지 관리는 전용 스레드, 디코딩은 i.MX8의 VPU/GPU가 맡도록 계층을 나눴습니다.</span></figcaption></figure>

| 구분 | 사양 |
|------|------|
| Processor | NXP i.MX8 QuadMax (VAR-SOM-MX8QM) |
| VPU | 4K H.265/H.264 디코딩, 1080p60 H.264 인코딩 |
| Memory / Storage | 4 GB DDR4 / 64 GB eMMC |
| OS · Framework | Yocto Linux · Qt 5.15 · GStreamer |
| Display | 10.4″ LCD 1024×768, 터치 패널 |
| Network | M12 Ethernet (100 Mbps / 1 Gbps) |
| 동작 환경 | DC 110 V 입력, −40 ℃ ~ +85 ℃ |

## 화면 구성

<div class="fig-grid">
<figure class="fig"><div class="frame dark"><img src="assets/img/ctm/ui-status.webp" alt="재생 현황 화면: 달력, FTP·스토리지 상태, 18채널 타임라인"></div><figcaption><b>STATUS</b><span>달력에서 녹화가 있는 날짜를 고르면 18채널 녹화 구간이 표시됩니다. 오른쪽 위에 스토리지 사용량과 자동 삭제 설정이 있습니다.</span></figcaption></figure>
<figure class="fig"><div class="frame dark"><img src="assets/img/ctm/ui-play.webp" alt="재생 화면: 2×2 영상 영역과 하단 타임라인 컨트롤"></div><figcaption><b>PLAY</b><span>2×2 분할 재생 화면입니다. 하단 타임라인으로 시각을 옮기거나 ±10초 건너뛰기를 할 수 있고, 2시간부터 15분 단위까지 확대할 수 있습니다.</span></figcaption></figure>
</div>

<figure class="fig"><div class="frame dark"><img src="assets/img/ctm/ui-download.webp" alt="다운로드 화면: 기간과 카메라를 선택해 파일 목록 조회"></div><figcaption><b>DOWNLOAD</b><span>카메라와 기간을 골라 녹화 파일을 조회하고 외부 저장장치로 내보냅니다. 화면은 실제 .ui 리소스를 더미 데이터로 렌더링한 것입니다.</span></figcaption></figure>

## 핵심 기술

### 1. 채널별 하드웨어 가속 재생 파이프라인

채널마다 `QMediaPlayer`가 GStreamer 파이프라인을 직접 구동합니다. 초기에는 `tsdemux → h264parse → v4l2h264dec`로 H.264 전용 체인을 구성했는데, 이후 `decodebin` 기반으로 바꿔 H.265와 `.mkv` 컨테이너까지 같은 경로로 처리합니다. 디코딩된 프레임은 GPU 2D 엔진(`imxvideoconvert_g2d`)으로 스케일링해 CPU 부하 없이 4채널을 동시에 출력합니다. x86 빌드 경로도 따로 두어 PC에서 UI와 로직을 먼저 검증할 수 있게 했습니다.

### 2. NVR 연동과 무중단 스트리밍

차량 NVR은 카메라·이벤트·날짜별 디렉터리에 1분 단위 세그먼트를 저장합니다. libcurl 기반 FTP 모듈이 날짜 하나를 고를 때마다 90개 디렉터리(18 카메라 × 5 이벤트)를 병렬로 조회해 달력과 타임라인을 채웁니다. 재생할 때는 채널 전용 `QThread`가 현재 파일을 받자마자 재생을 시작하고, 곧바로 다음 세그먼트를 Prefetch합니다.

### 3. 4채널 Time Sync

<figure class="fig"><div class="frame pad"><img src="assets/diagrams/ctm-sync-pipeline.svg" alt="4채널 Time Sync 개념도와 GStreamer 파이프라인"></div><figcaption><b>FIG 2</b><span>모든 채널이 하나의 절대 시간축을 따릅니다. 재생 시각을 하나의 마스터 클럭이 정하고, 각 채널은 세그먼트 경계에서 Prefetch해 둔 다음 파일로 넘어갑니다.</span></figcaption></figure>

- 파일명에 있는 14자리 타임스탬프로 각 세그먼트의 절대 시각을 계산합니다. NVR 저장 시각의 ±1초 지터는 보정합니다.
- 1 Hz 마스터 클럭이 네 플레이어에 같은 재생 시각을 전달하고, **네 채널이 모두 준비된 뒤에 함께 재생을 시작**합니다.
- Seek할 때 목표 시각이 현재 파일 안에 있으면 위치만 옮기고, 벗어나면 해당 세그먼트를 새로 받아 재생합니다. 녹화가 없는 구간은 검은 화면에 정보 오버레이를 띄웁니다.

### 4. 무인 환경을 고려한 안정성

- 10초마다 스토리지를 확인하고, 여유 공간이 20% 아래로 내려가면 캐시를 자동으로 지웁니다.
- 다운로드 타임아웃이 나면 사용자가 재시도·계속 여부를 고를 수 있는 복구 UI를 띄웁니다.
- 재생 화면은 한 번 터치로 1분할과 4분할을 오갈 수 있습니다. 현장 피드백을 반영해 처음의 더블 클릭 방식에서 바꿨습니다.

## 품질 · 납품 프로세스

| 버전 | 일자 | 내용 |
|------|------|------|
| v0.1.0 | 2024-09-24 | 기본 UI 골격, FTP 조회 |
| v0.2.0 ~ v0.3.0 | 10-01 ~ 10-08 | 4채널 재생, 타임라인 |
| v0.4.0 ~ v0.5.0 | 10-19 ~ 10-29 | 코덱 확장(decodebin), Time Sync·Seek |
| **v1.0.0** | **2024-11-01** | 전체 기능 완료 · 납품 |
| 유지보수 | ~ 2025-01 | 자동 삭제 모드 등 운영 개선 |

- **코딩 표준**: 철도차량 제작사의 MISRA C/C++ 룰셋(사이버보안 룰 포함)을 적용하고 정적 분석 리포트를 함께 제출했습니다.
- **문서화**: 파일별 Doxygen 주석을 작성했고, 주석률은 요구 기준 35%를 넘는 40–61%입니다.
- **형상 관리**: Git으로 관리하며 매주 진행 보고와 함께 태그 릴리스를 배포했습니다.

## 기술 스택

| 영역 | 내용 |
|------|------|
| 언어 | C++ (Qt 5.15), Qt Designer UI |
| 멀티미디어 | GStreamer, i.MX VPU, G2D (`imxvideoconvert_g2d`) |
| 네트워크 | libcurl FTP (EPSV, 타임아웃·재시도) |
| 동시성 | QThread, QtConcurrent, 시그널/슬롯 |
| 플랫폼 | NXP i.MX8 QuadMax, Yocto Linux, x86 시뮬레이션 빌드 |
| 품질 | MISRA C/C++, 정적 분석, Doxygen |

## 프로젝트 의의

철도 차량의 영상 기록은 사고 조사와 안전 관리의 핵심 근거 자료입니다. 이 프로젝트에서는 가혹한 환경 조건과 엄격한 코딩 표준 아래에서, **여러 카메라 영상을 같은 시각으로 맞춰 바로 확인할 수 있는 조회 도구**를 짧은 기간에 납품했습니다. 임베디드 리눅스 멀티미디어 파이프라인 설계부터 Qt UI, 납품 문서화까지 한 번에 수행한 사례입니다.
