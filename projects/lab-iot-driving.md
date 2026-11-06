# IoT 기반 OBD-II 연비 운전 보조 시스템

## 개요

차량의 OBD-II 데이터와 별도 센서를 결합해 운전자에게 **실시간 연비 운전 코칭**을 해 주고, 주행 기록과 고장 정보를 **서버와 스마트폰 앱**으로 언제든 확인할 수 있게 한 커넥티드카 IoT 시스템입니다. 차량 단말, 센서 노드, 웹 서버, Android 앱의 네 부분을 모두 설계·구현해, 임베디드부터 서버·모바일까지 한 번에 연결한 프로젝트입니다.

<div class="highlights">
<div><h4>차량 단말 (In-car Unit)</h4><p>Raspberry Pi와 7″ 터치스크린으로 RPM, 속도, 스로틀, 고장 코드를 실시간 표시하고 연비 운전을 안내합니다.</p></div>
<div><h4>센서 노드 (ESP8266)</h4><p>자이로, GPS, CO₂·온습도 센서 노드 3개가 Wi-Fi MQTT로 데이터를 보냅니다. 자이로로 도로 경사를 계산합니다.</p></div>
<div><h4>웹 서버 (Flask · MySQL)</h4><p>REST API 14개로 차량 등록, 주행·위치·기록·고장 코드 갱신과 조회를 처리하고, 고장이 나면 FCM 푸시를 보냅니다.</p></div>
<div><h4>Android 앱</h4><p>로그인, 차량 등록, 주행 기록·점수, 연비 차트, 고장 진단 상세, 주차 위치 지도를 제공합니다.</p></div>
</div>

## 시스템 구성

<figure class="fig"><div class="frame pad"><img src="assets/diagrams/iot-architecture.svg" alt="IoT 연비 운전 보조 시스템 구성도: 차량, 차량 단말, 서버, Android 앱"></div><figcaption><b>FIG 1</b><span>시스템 구성. 차량 단말이 OBD-II(Bluetooth)와 센서 노드(MQTT) 데이터를 모아 화면과 음성으로 안내하고, 주행 데이터를 HTTP로 서버에 올립니다. 스마트폰 앱은 REST API로 기록을 조회하고, 고장 코드는 푸시로 받습니다.</span></figcaption></figure>

### 차량 단말
- **OBD 수집**: ELM327 Bluetooth 어댑터와 python-OBD로 RPM, 속도, 스로틀, 흡기 압력·온도, 고장 코드(DTC)를 비동기로 구독하고, 이 값들로 연비를 계산합니다.
- **대시보드**: PyQt5(Qt Designer)로 만든 전체 화면 UI에 연비 게이지, 날씨, 실내 공기질, 경고를 표시합니다.
- **연비 코칭**: 자이로 노드가 계산한 도로 경사와 차량 상태를 바탕으로, 관성 주행이 가능한 구간을 음성으로 안내합니다. 급제동·급가속·고RPM 횟수로 주행 점수를 계산해 음성으로 알려 주고, 주행이 끝나면 연비·평균 속도·거리와 함께 서버에 기록합니다.
- **음성 비서**: Wake word를 감지하면 STT로 명령을 받고, TTS로 응답해 운전 중에도 손을 쓰지 않고 조작할 수 있습니다.

### 센서 노드
- ESP8266(Arduino) 노드 3개: **MPU6050 자이로**(경사), **GPS**(위치·주차 위치), **MQ135·DHT11**(CO₂·온습도)
- 각 노드가 MQTT 토픽으로 측정값을 발행하고, 차량 단말이 구독합니다.

### 웹 서버
- Python **Flask** REST API 14개: 사용자·차량 등록과 삭제, 주행·GPS·고장 코드·주행 기록 갱신, 최근 기록·차트·위치·주차 위치·고장 코드 조회
- **MySQL** 스키마: 사용자, 차량, 주행, 위치, 주행 기록(속도·RPM·급제동·급가속·점수), 고장 코드(코드·설명)
- 고장 코드가 들어오면 **FCM**으로 차주 스마트폰에 푸시 알림을 보냅니다.
- 클라우드 서버(Ubuntu)에 배포했습니다.

### Android 앱
- Java · Android Studio로 개발했습니다.
- **Firebase Auth** 로그인과 차량 등록
- 주행 기록과 점수 목록, **MPAndroidChart** 연비·주행 차트
- 고장 코드 목록과 상세 설명, **FCM** 푸시 수신
- **Google Maps** 차량·주차 위치 표시

## 시험 환경

- 실차(가솔린 SUV)와 OBD-II 에뮬레이터로 차량 데이터 수집을 검증했습니다.
- 차량 단말은 Raspbian, 서버는 Ubuntu, 앱은 Android 8.0 단말에서 시험했습니다.

## 기술 스택

| 영역 | 내용 |
|------|------|
| 차량 단말 | Raspberry Pi 3, 7″ 터치스크린, Python 3, PyQt5, python-OBD, ELM327 (Bluetooth) |
| 센서 노드 | ESP8266 (Arduino), MPU6050, GPS (TinyGPS++), MQ135, DHT11, MQTT (PubSubClient) |
| 웹 · 서버 | Python Flask (REST API), MySQL, flask-mysqldb, FCM 푸시 (pyfcm), Ubuntu 클라우드 서버 |
| 앱 | Android (Java), Firebase Auth · Cloud Messaging, Google Maps SDK, MPAndroidChart, Glide |
| 음성 · 외부 API | Wake word 감지, 클라우드 STT · TTS, 날씨 API |
