# 약국용 5채널 시럽 자동 토출기 펌웨어 · 제어 소프트웨어

## 프로젝트 개요

약국에서 물약(시럽)을 조제할 때는 처방량만큼 계량해 따르는 반복 작업이 많습니다. 알파팜텍과 함께 이 과정을 자동화하는 **5채널 시럽 자동 토출기**의 펌웨어와 PC 제어 소프트웨어를 개발했습니다. 2023년 솔레노이드 밸브 시제품에서 시작해 산업용 컨트롤러 기반 제품(PharmSyrupUltra)으로 발전시켰고, **v1.0부터 v1.4.1까지 13회 릴리스**하며 2년 넘게 기능을 확장했습니다.

<figure class="fig"><div class="frame dark"><img src="assets/img/alphafarmtech/dispensing-oled.webp" alt="토출 중인 시제품: 컨트롤러 보드, OLED에 '홍길동 150mL' 표시, 계량컵에 시럽 토출"></div><figcaption><b>v1.4</b><span>토출 시연 장면입니다. 각 토출구 옆 OLED에 환자명과 토출량을 한글로 표시하고, 스테핑 펌프가 설정량만큼 정량 토출합니다. 표시된 이름은 테스트용 데이터입니다.</span></figcaption></figure>

<div class="highlights">
<div><h4>5채널 독립 정량 토출</h4><p>토출구마다 독립 상태 머신을 두고, TB6600 드라이버와 스테핑 펌프로 78 pulse/mL 정량 제어와 가중치(용량 배율) 보정을 합니다.</p></div>
<div><h4>RS485 Modbus RTU</h4><p>토출구당 28개, 총 140개 홀딩 레지스터에 명령, 상태, 용량, 환자명, 약물명(UTF-8)을 매핑했습니다. 약국 PC나 상위 시스템과 표준 방식으로 연동됩니다.</p></div>
<div><h4>한글 OLED 렌더링 엔진</h4><p>UTF-8 문자열을 초성·중성·종성으로 분해해 조합형 비트맵 폰트(360 글리프)로 그리는 엔진을 직접 구현했습니다. 5개 OLED는 I²C 멀티플렉서로 묶었습니다.</p></div>
<div><h4>약국 현장 안전 설계</h4><p>토출구별 비상정지, 누르는 동안만 동작하는 수동 추출, 8초 워치독, 미사용 시 모터 Enable 차단을 넣었습니다.</p></div>
</div>

## 시스템 구성

<figure class="fig"><div class="frame pad"><img src="assets/diagrams/alphafarm-architecture.svg" alt="시럽 자동 토출기 시스템 구성도"></div><figcaption><b>FIG 1</b><span>시스템 구성. PC 테스트 앱은 RS485 Modbus RTU로 컨트롤러와 통신하고, 컨트롤러는 펌프 드라이버 5개, 버튼 15개, OLED 5개를 직접 제어합니다. 2차 과제인 AI 음료 추천 GUI는 같은 펌웨어를 텍스트 명령으로 구동합니다.</span></figcaption></figure>

| 구분 | 사양 |
|------|------|
| 컨트롤러 | Faduino FA-DUINO-32TA (ATmega2560 산업용 보드) |
| 펌프 구동 | TB6600 스테핑 드라이버 ×5, 200 pulse/rev, 78 pulse/mL |
| 디스플레이 | 128×64 OLED ×5 (SSD1309), TCA9548A I²C 멀티플렉서 |
| 입력 | 추출 LED 버튼 · 수동 버튼 · 비상정지 버튼 각 5개 |
| 통신 | RS485 Modbus RTU, 9600 bps, Slave ID 1 |
| PC 앱 | Python · PyQt5 · pymodbus, 50 ms 상태 폴링, 실행 파일 배포 |

## 토출 제어 로직

<figure class="fig"><div class="frame pad"><img src="assets/diagrams/alphafarm-state.svg" alt="토출구 상태 머신"></div><figcaption><b>FIG 2</b><span>토출구 상태 머신. 약물을 설정하면 대기 상태로 바뀌고 버튼 LED가 점멸합니다. 약사가 컵을 놓고 버튼을 누르면 추출을 시작하고, 목표 펄스에 도달하면 완료됩니다. 비상정지는 어느 상태에서든 즉시 정지시킵니다.</span></figcaption></figure>

- 5개 채널의 스텝 펄스를 약 1 kHz 공통 타이머로 동시에 생성해, 여러 처방을 **병렬로 토출**할 수 있습니다.
- 목표 펄스 수는 `설정 용량 × 가중치 × 78 pulse/mL`로 계산합니다. 예를 들어 30 mL × 1.1이면 33 mL를 토출합니다.
- 청소 모드(CMD=2)는 배관 세척용으로 500 mL를 연속 토출하고, OLED에 `CLEAN`을 표시합니다.

### Modbus 레지스터 구성 (토출구 n, 기준 주소 = 28·n)

| Offset | R/W | 내용 |
|------|------|------|
| 0 | W | 명령 — 1: 약물 설정, 2: 청소 |
| 1 | R | 상태 — 정지 / 대기 / 추출 중 / 완료 / 수동 |
| 2 | W | 토출 용량 (mL) |
| 3 | W | 가중치 × 100 |
| 4 – 15 | W | 환자명 (UTF-8, 24 bytes) |
| 16 – 27 | W | 약물명 (UTF-8, 24 bytes) |

## 한글 표시 엔진

<div class="fig-grid">
<figure class="fig"><div class="frame dark"><img src="assets/img/alphafarmtech/five-oled-bench.webp" alt="5개 OLED에 한글 정보가 표시된 벤치 테스트"></div><figcaption><b>v1.0</b><span>5채널 OLED 한글 표시 벤치 테스트</span></figcaption></figure>
<figure class="fig"><div class="frame"><img src="assets/img/alphafarmtech/pc-test-app.webp" alt="PC 테스트 앱: 토출구 선택, 키패드, 사용자 이름, 약물명, 가중치 입력"></div><figcaption><b>PC APP</b><span>PyQt5 테스트 앱. 토출구 선택, 용량 키패드, 환자명·약물명·가중치 입력</span></figcaption></figure>
</div>

8-bit MCU에 완성형 한글 폰트 전체(11,172자)를 넣을 수는 없습니다. 그래서 PC에서 받은 UTF-8 문자열을 유니코드 산술로 **초성·중성·종성으로 분해**한 뒤, 자모 글리프를 겹쳐 그리는 **조합형 비트맵 폰트**로 렌더링했습니다. 360개 글리프만으로 모든 한글을 표시하고, 토출량은 32×32로 확대해 멀리서도 잘 보이도록 했습니다.

## 버전 이력

| 버전 | 주요 변경 |
|------|------|
| 2023 시제품 | 솔레노이드 밸브 + 유량 센서 + IR 컵 감지, PyQt 키패드 GUI |
| v1.0 – v1.1 | 산업용 보드로 이전, 5채널 OLED 한글 표시, 약물명 추가 |
| v1.2 – v1.2.1 | 가중치(용량 배율), 비상정지, OLED 컨트롤러 변경(SSD1309) 대응 |
| v1.3.x | DC 모터 펌프 → **TB6600 스테핑 펌프** 전환으로 정량 정밀도 개선 |
| v1.4.0 – v1.4.1 | **RS485 Modbus RTU** 적용, 폴링·타임아웃 안정화 |

## 2차 과제 — AI 음료 추천 디스펜서

<figure class="fig"><div class="frame dark"><img src="assets/img/alphafarmtech/drink-recommend.webp" alt="AI 음료 추천 시스템 GUI: 운동 정보, 신체 정보 입력과 추천 결과"></div><figcaption><b>2025.08</b><span>AI 음료 추천 GUI. 활동량, 운동 강도, 신체 정보를 입력하면 LLM이 음료 조합과 이유를 제시하고, 같은 5채널 토출기가 그대로 토출합니다.</span></figcaption></figure>

같은 하드웨어 플랫폼을 운동 후 음료 디스펜서로 확장한 과제입니다. 사용자가 입력한 활동 정보를 **LLM(Llama 3.3 70B, Groq API)**에 보내 5종 음료의 배합량(mL)과 추천 이유를 받고, 그 결과를 시리얼 명령으로 바꿔 토출기를 구동합니다. 기존 펌웨어를 고치지 않고 상위 애플리케이션만 바꿔 새 제품 콘셉트를 시연했습니다.

## 기술 스택

| 영역 | 내용 |
|------|------|
| 펌웨어 | C/C++ (Arduino · PlatformIO), ATmega2560, 타이머 인터럽트, 워치독 |
| 모션 | TB6600 스테핑 드라이버, 펄스 기반 정량 제어 |
| 통신 | Modbus RTU (RS485), 텍스트 시리얼 프로토콜 |
| 디스플레이 | SSD1309 OLED, TCA9548A, 조합형 한글 비트맵 폰트 |
| PC | Python, PyQt5, pymodbus, pyserial, LLM API 연동 |

## 프로젝트 의의

약국 조제 업무 중 반복성이 큰 시럽 계량을 자동화해, 약사가 처방 확인과 복약 지도에 더 집중할 수 있게 하는 장비입니다. 시제품에서 제품으로 가는 동안 구동 방식(밸브 → DC 모터 → 스테핑), 통신(텍스트 → Modbus RTU), 디스플레이 하드웨어가 모두 바뀌었습니다. 그때마다 펌웨어와 PC 소프트웨어를 함께 고쳐 **장기간 제품 개발을 이어서 지원**한 사례입니다.
