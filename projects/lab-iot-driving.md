# IoT 기반 OBD-II 연비 운전 보조 시스템 (졸업작품)

## 개요

차량 OBD-II 데이터와 센서를 결합해 운전자에게 **연비 운전 코칭**을 해 주는 IoT 시스템입니다. 4인 팀 졸업작품으로 개발했고, 전체 커밋 144개 중 111개를 직접 작성했습니다. 2018 한이음 ICT 공모전 입선작이며, 지금의 차량·임베디드 개발 역량의 출발점이 된 프로젝트입니다.

<div class="fig-grid">
<figure class="fig"><div class="frame dark"><img src="assets/img/lab/iot-prototype.webp" alt="7인치 디스플레이에 연비 대시보드가 표시된 시제품"></div><figcaption><b>PROTO</b><span>시제품. 7″ 디스플레이 대시보드와 자이로·GPS 센서 회로</span></figcaption></figure>
<figure class="fig"><div class="frame"><img src="assets/img/lab/iot-architecture.webp" alt="IoT 보드, OBD-II, 클라우드 DB, 스마트폰 시스템 구성도"></div><figcaption><b>SYSTEM</b><span>차량 OBD-II · IoT 보드 · 클라우드 DB · 모바일 앱 구성</span></figcaption></figure>
</div>

## 주요 기능

- **실시간 대시보드**: RPM, 속도, 스로틀, 고장 코드를 표시하고 음성으로 조작할 수 있습니다.
- **경사 기반 코칭**: 자이로 센서로 도로 경사를 측정해, 연료를 아끼는 관성 주행 시점을 알려 줍니다.
- **센서 노드 · 모바일 앱**: ESP8266 센서 노드가 MQTT로 데이터를 보내고, Android 앱에서 주행 이력과 연비를 확인합니다.

<figure class="fig"><div class="frame"><img src="assets/img/lab/iot-dashboard.webp" alt="연비·RPM·속도 게이지 대시보드 화면"></div><figcaption><b>GUI</b><span>PyQt5 연비 대시보드 화면</span></figcaption></figure>

## 기술 스택

Raspberry Pi 3 · LattePanda · ESP8266 · ELM327 · MPU6050 · GPS · PyQt5 · Flask · MySQL · Android · MQTT

## 기간

2017.12 – 2019.02
