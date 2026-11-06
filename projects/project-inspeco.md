# 열화상·초음파 복합 진단기 X1 Android 앱 고도화

## 프로젝트 개요

인스펙코의 **X1**은 전력 설비의 이상 발열과 부분방전을 진단하는 산업용 장비입니다. USB 열화상 모듈, 실화상 웹캠, Wi-Fi 초음파 센서를 Android 태블릿 하나로 운용합니다. 2021년 이후 유지보수가 끊겨 빌드가 깨진 상태였던 앱 코드베이스를 인수해 복구했고, 이후 **3건의 개발 계약을 연속으로 수주·납품**했습니다.

마지막 단계에서는 해상도가 6.7배 큰 **640×512 신규 열화상 모듈**을 포팅했습니다. 해상도가 커지면서 2 FPS까지 떨어졌던 실시간 화면을 렌더링 구조를 바꿔 **23 FPS**로 끌어올렸습니다. 2인 공동 수급 프로젝트였고, Android 앱 개발 전체를 맡았습니다.

<figure class="fig narrow"><div class="frame dark"><video src="assets/img/inspeco/mix-overlay-live.mp4" poster="assets/img/inspeco/mix-overlay-live-poster.webp" autoplay muted loop playsinline aria-label="복합진단 모드 실시간 화면"></video></div><figcaption><b>LIVE</b><span>640×512 모듈 복합진단 모드의 실제 동작 화면입니다. 실화상 위에 열화상을 겹쳐 실시간으로 그리고, 최고·최저 온도 지점을 따라가며 표시합니다. 장비 화면을 휴대폰으로 촬영했습니다.</span></figcaption></figure>

<div class="highlights">
<div><h4>렌더링 병목 제거 — 2 → 23 FPS</h4><p>픽셀마다 그리기 API를 부르던 구조(프레임당 32.7만 회)를 ARGB 버퍼에 한 번에 채운 뒤 한 번 업로드하는 구조로 바꿨습니다.</p></div>
<div><h4>신규 640×512 모듈 포팅</h4><p>256×192 하드코딩 38곳을 공통 해상도 설정으로 리팩터링했습니다. USB 제품명으로 모듈을 자동 판별해 두 카메라를 단일 APK로 지원합니다.</p></div>
<div><h4>측정·분석 기능 확장</h4><p>최고·최저 온도 실시간 추적, 측정점 기준 Span 모드, 256단계 plasma 컬러맵을 구현했습니다.</p></div>
<div><h4>보고서·현지화</h4><p>열화상·복합·초음파 3종 보고서에 Excel(XLSX) 내보내기를 추가하고 중국어·영어 현지화를 완성했습니다.</p></div>
</div>

## 진행 경과

<figure class="fig"><div class="frame pad"><img src="assets/diagrams/inspeco-timeline.svg" alt="인스펙코 X1 프로젝트 진행 타임라인"></div><figcaption><b>FIG 1</b><span>진행 타임라인. 코드베이스 인수와 PC 툴 개발에 이어 3건의 계약을 겹치는 일정으로 진행했습니다. 최적화는 2025년 1월 중순, 단일 APK 통합은 1월 21일에 완료했습니다.</span></figcaption></figure>

| 단계 | 기간 | 주요 내용 |
|------|------|------|
| 코드베이스 인수 | 2024.07 – 08 | 구 Gradle/AGP 환경에서 깨진 빌드 복구, 첫 이슈 수정 |
| 초음파 PC 툴 | 2024.10 – 11 | PyQt5 기반 실시간 dB·파형 표시, 열화상·실화상 뷰어, Excel 리포트 |
| 1차 계약 | 2024.10 – 2025.01 | 고객 요청 개선 13건: 보고서 데이터 혼입 수정, 녹음 경로 분리, 중국어 문구 등 |
| 2차 계약 | 2024.12 – 2025.01 | 최고·최저 온도 추적, Level/Span 모드, Excel 보고서 |
| 3차 계약 | 2025.01 – 02 | 640×512 모듈 포팅, 듀얼 모듈 단일 APK, 실시간 성능 최적화 |

같은 고객사의 초음파 진단 장비(P1)용 Android 앱 개발(2023.03–11)이 계기가 되어 X1 프로젝트를 맡게 되었습니다.

## 앱 구조

<figure class="fig"><div class="frame pad"><img src="assets/diagrams/inspeco-architecture.svg" alt="X1 Android 앱 구조도"></div><figcaption><b>FIG 2</b><span>앱 구조. 열화상 모듈의 온도 배열은 네이티브 IR SDK를 거쳐 Java 렌더러로 전달되고, 여기서 컬러맵 변환, 오버레이, 측정점 표시를 처리합니다. 강조된 블록이 이번 프로젝트에서 새로 구현하거나 대폭 수정한 부분입니다.</span></figcaption></figure>

- **카메라 계층**: USB UVC로 열화상 모듈과 웹캠을 연결합니다. 네이티브 IR SDK가 프레임마다 `float[w×h]` 온도 배열을 콜백으로 넘겨줍니다.
- **렌더러**: 1920×1080 캔버스에 열화상 컬러맵, 실화상 합성(Mix), 측정점 A–G, 중앙 타깃, 컬러바, 초음파 dB HUD를 그립니다.
- **진단 흐름**: 설비 종류, 전압, 재질, 불량 유형을 고르면 측정값과 합쳐 상태 등급을 판정하고 게이지 화면과 보고서로 이어집니다.

## 핵심 과제 ① 640×512 모듈 포팅과 듀얼 모듈 지원

<figure class="fig"><div class="frame pad"><img src="assets/diagrams/inspeco-dual-module.svg" alt="열화상 모듈 런타임 판별 흐름"></div><figcaption><b>FIG 3</b><span>런타임 모듈 판별. USB 장치가 연결되면 제품명으로 웹캠, 256×192 모듈, 640×512 모듈을 구분하고, 판별한 해상도를 UVC 핸들러부터 렌더러, 보고서까지 모든 단계에 적용합니다.</span></figcaption></figure>

기존 앱은 256×192 해상도를 전제로 작성되어 있어서, 버퍼 크기, 좌표 변환, 측정점 계산 등 **38곳에 해상도가 하드코딩**되어 있었습니다. 이를 모두 공통 설정값으로 바꾸고, 연결 시점에 USB 제품명(`S0-6x` / `FX3`)으로 모듈을 판별하도록 했습니다. 그 결과 카메라별로 따로 빌드하던 APK 2개를 **하나로 합쳐** 현장 배포·관리가 단순해졌습니다.

## 핵심 과제 ② 실시간 성능 최적화

신규 모듈을 연결하자 픽셀 수가 49,152개에서 327,680개로 **6.7배** 늘어나면서 복합진단 화면이 2 FPS까지 떨어졌습니다. 원인을 추적해 보니 렌더러가 **픽셀마다** `Color.HSVToColor`와 `Canvas.drawPoint`를 호출하고 있었습니다. 해상도가 커지자 이 호출 비용이 그대로 프레임 시간으로 이어진 것이었습니다.

<figure class="fig"><div class="frame pad"><img src="assets/diagrams/inspeco-optimization.svg" alt="렌더링 최적화 전후 파이프라인 비교"></div><figcaption><b>FIG 4</b><span>최적화 전후 파이프라인. 픽셀 단위 API 호출을 없애고, 메모리 안에서 색을 계산해 버퍼를 한 번만 업로드하도록 바꿨습니다. 640×512 모듈에서 측정했습니다.</span></figcaption></figure>

<div class="compare">
<div><h5>Before</h5><p class="big">2 / 5 FPS</p><p>복합진단 / Span 모드. 픽셀마다 drawPoint·setPixel 호출이 프레임당 32.7만 회 발생</p></div>
<div class="arrow">→</div>
<div class="after"><h5>After</h5><p class="big">23 / 15 FPS</p><p>단일 루프로 int[] ARGB 버퍼를 채우고 setPixels 1회 업로드. HSV 변환 인라인화, 나눗셈을 역수 곱셈으로 대체</p></div>
</div>

- 온도를 색으로 바꾸는 과정을 하나의 루프로 합치고, 임계값 미만이거나 NaN인 픽셀은 바로 건너뜁니다.
- 프레임마다 반복되는 `1 / (max − min)` 나눗셈을 미리 계산한 역수 곱셈으로 바꿨습니다.
- Span 모드는 256단계 plasma LUT를 인덱싱해서 색을 고르고, 최종 비트맵은 스케일링한 `drawBitmap` 한 번으로 화면에 그립니다.

## 측정 기능

<div class="fig-grid three">
<figure class="fig"><div class="frame dark"><img src="assets/img/inspeco/minmax-markers.webp" alt="최고·최저 온도 마커가 표시된 열화상 화면"></div><figcaption><b>MIN/MAX</b><span>최고·최저 온도 지점을 좌표 마커로 실시간 추적</span></figcaption></figure>
<figure class="fig"><div class="frame dark"><img src="assets/img/inspeco/span-mode.webp" alt="plasma 컬러맵 Span 모드 화면"></div><figcaption><b>SPAN</b><span>측정점 A 주변 8×8 영역 기준 컬러 범위 + plasma LUT</span></figcaption></figure>
<figure class="fig"><div class="frame dark"><img src="assets/img/inspeco/mix-overlay.webp" alt="실화상 위 열화상 오버레이 복합진단 화면"></div><figcaption><b>MIX</b><span>실화상 웹캠 영상 위에 열화상을 겹친 복합진단 화면</span></figcaption></figure>
</div>

<figure class="fig"><div class="frame pad"><img src="assets/img/inspeco/plasma-lut.png" alt="256단계 plasma 컬러맵" style="height:28px;width:100%;image-rendering:auto"></div><figcaption><b>LUT</b><span>Span 모드에 쓰는 256단계 plasma 컬러맵. 앱 코드의 테이블을 그대로 렌더링한 것입니다.</span></figcaption></figure>

## 진단 판정 · 보고서 · 다국어

<div class="fig-grid three">
<figure class="fig"><div class="frame"><img src="assets/img/inspeco/zh-thermal-judgement.webp" alt="열화상 상태 판정 화면 (중국어)"></div><figcaption><b>판정</b><span>열화상 상태 판정 게이지 (중국어 로케일)</span></figcaption></figure>
<figure class="fig"><div class="frame"><img src="assets/img/inspeco/zh-mix-judgement.webp" alt="복합진단 상태 판정 화면 (중국어)"></div><figcaption><b>복합</b><span>열화상 + 초음파 복합진단 판정</span></figcaption></figure>
<figure class="fig"><div class="frame"><img src="assets/img/inspeco/zh-mix-report.webp" alt="복합진단 보고서 화면 (중국어)"></div><figcaption><b>보고서</b><span>복합진단 보고서 — PDF·Excel 내보내기</span></figcaption></figure>
</div>

- **Excel 보고서**: Apache POI로 셀 병합, 서식, 현장 사진 삽입까지 들어간 XLSX를 만듭니다. 기존 PDF 보고서와 함께 열화상, 복합, 초음파 3종에 모두 적용했습니다.
- **데이터 정합성**: 진단 모드별 보고서 데이터가 서로 섞이던 버그를 고치고, 모드별 녹음 저장 경로를 분리했습니다.
- **현지화**: 설비·자재 이름과 판정 문구까지 중국어·영어 번역을 완성했고, 언어를 바꿔도 보고서 양식이 깨지지 않도록 했습니다.

## 관련 작업 — 초음파 센서 PC 툴

같은 장비의 초음파 센서를 PC에서 분석하는 **PyQt5 툴**도 개발했습니다. USB 오디오 입력에서 실시간 dB와 파형을 표시하고, 열화상·실화상 뷰어, 임계값 알람, Excel 리포트 생성을 지원합니다(2024.10–11).

## 기술 스택

| 영역 | 내용 |
|------|------|
| 언어 | Kotlin, Java (렌더러), Python (PC 툴) |
| 카메라 | USB UVC, 네이티브 IR 열화상 SDK, 웹캠 동시 운용 |
| 그래픽 | Android Canvas/Bitmap 최적화, GL TextureView, 컬러맵 LUT |
| 보고서 | Android PdfDocument, Apache POI (XLSX) |
| 빌드 | Gradle 7 / AGP 7 마이그레이션, 모듈별 → 단일 APK 통합 |
| PC 툴 | PyQt5, USB 오디오 신호처리, Excel 리포트 |

## 성과

| 항목 | 결과 |
|------|------|
| 복합진단(Mix) 화면 | 2 FPS → **23 FPS** (640×512) |
| Span 모드 | 5 FPS → **15 FPS** |
| 지원 모듈 | 256×192 + 640×512, **단일 APK** |
| 수주 | 동일 고객 **연속 3건 계약** + PC 툴 + 이전 P1 앱 |

해상도가 6.7배 늘어난 상황에서 하드웨어를 바꾸지 않고 소프트웨어 구조 개선만으로 실시간성을 회복했습니다. 오래된 코드베이스를 인수해 안정화하면서 기능을 늘린 경험은, 레거시 장비 소프트웨어를 고도화하려는 고객에게 그대로 적용할 수 있습니다.
