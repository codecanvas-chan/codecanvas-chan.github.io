# EDOF 3D 현미경 통합 제어 시스템

## 프로젝트 개요

**EDOF(Extended Depth of Field) 3D 현미경**은 초점 위치를 바꿔 가며 여러 장을 촬영하고 합성해 깊이 정보가 있는 이미지를 만드는 장비입니다. 이 프로젝트에서는 장비를 구성하는 카메라, 조명, 대물렌즈 리볼버, 줌, XYZ 스테이지를 **하나의 터치 GUI로 통합 제어**하는 시스템을 팀 단위로 개발했습니다.

이 중 **3축 서보 모션 제어 서버**, **모션 제어 GUI**, 서비스 구성·시스템 통합을 맡았습니다. 모든 장치는 유선 Ethernet 위의 MQTT 메시지로 연결해, 장치를 추가하거나 바꾸더라도 GUI를 고칠 일이 거의 없는 구조로 설계했습니다.

<div class="highlights">
<div><h4>3축 서보 모션 서버</h4><p>FASTECH Ezi-SERVO II Plus-E 서보 3대(X/Y/Z)를 Ethernet으로 제어하는 Linux C++ 서버입니다. 서보 ON, 조그, 상대·절대 이동, 원점 복귀, 리밋 상태 보고를 지원합니다.</p></div>
<div><h4>키오스크형 모션 GUI</h4><p>800×480 터치 화면용 Qt5 GUI입니다. 3단 속도(3/5/10 mm/s), 가속도·증분 이동 설정, 리밋·원점 상태 표시를 제공합니다.</p></div>
<div><h4>MQTT 기반 장치 통합</h4><p>렌즈, 조명, 모션 장치를 토픽 단위로 나눠 메시지로 연동합니다. 장치마다 독립적으로 재시작하고 진단할 수 있습니다.</p></div>
<div><h4>정밀 렌즈 위치 제어</h4><p>DC 기어모터와 하드웨어 펄스 카운터(PCNT) 엔코더로 대물렌즈 리볼버를 0.5° 단위로 위치 제어하고, 포토센서로 원점을 잡습니다.</p></div>
</div>

## 시스템 구성

<figure class="fig"><div class="frame pad"><img src="assets/diagrams/microscope-architecture.svg" alt="EDOF 3D 현미경 제어 시스템 구성도"></div><figcaption><b>FIG 1</b><span>시스템 구성. Raspberry Pi의 GUI와 모션 서버, ESP32-S3 렌즈 컨트롤러, LED 컨트롤러가 MQTT 브로커로 연결됩니다. XYZ 서보는 모션 서버가 FASTECH 전용 Ethernet 프로토콜로 직접 구동합니다.</span></figcaption></figure>

| 구성 | 내용 |
|------|------|
| 메인 컨트롤러 | Raspberry Pi, Linux, Qt5 C++ GUI (800×480 터치), systemd 서비스 |
| 모션 | FASTECH Ezi-SERVO II Plus-E ×3 (X·Y·Z 폐루프 서보), Ethernet TCP |
| 렌즈 컨트롤러 | ESP32-S3 + W5500 Ethernet, FreeRTOS, PWM 15 kHz DC 모터 구동 |
| 조명 | LED 4채널 (반사광 · 투과광) |
| 카메라 | 산업용 카메라 (Hikrobot SDK) |
| 메시징 | MQTT (JSON), 장치별 토픽 분리 |

## 모션 제어 서버

- 서보 3축을 각각 연결 객체로 관리하고, MQTT로 받은 JSON 명령을 FASTECH Plus-E 프로토콜 호출로 변환합니다.
- **지원 명령**: 서보 ON/OFF, 조그(+/−), 상대·절대 위치 이동, 원점 복귀, 정지, 알람·위치 초기화, 현재 위치·상태 조회
- 리밋 센서, 원점 상태, 알람을 주기적으로 읽어 GUI에 알리므로, 작업자는 축의 상태를 한눈에 확인할 수 있습니다.
- systemd 서비스로 등록해 장비 전원을 켜면 GUI와 모션 서버가 자동으로 함께 실행됩니다.

## 렌즈 리볼버 위치 제어

<figure class="fig"><div class="frame pad"><img src="assets/diagrams/microscope-revolver.svg" alt="대물렌즈 리볼버 위치 제어 흐름"></div><figcaption><b>FIG 2</b><span>리볼버 위치 제어 흐름. 목표 각도를 받으면 최단 회전 방향을 고르고, 엔코더 펄스를 하드웨어 카운터로 세어 0.5° 단위로 위치를 갱신합니다. 원점 복귀는 포토센서 인터럽트를 기준으로 합니다.</span></figcaption></figure>

- 기어비 118:17, 엔코더 4,172 pulse/rev에서 **1°당 약 80.4 펄스**이므로, 40펄스마다 0.5°씩 위치를 갱신합니다.
- 줌 축에는 리밋 센서와 과토크 감지를 넣어 기구가 끝에 부딪히지 않도록 보호합니다.
- 대물렌즈 배율(5×/10×/20×/50×)과 줌 단계에 맞춘 배율표를 GUI에서 관리합니다.

## 초기 PoC — Modbus-TCP 모터 제어

본 개발 전에 통신 방식을 검증하려고 **ESP32 + W5500 Modbus-TCP 펌웨어**와 **C#(NModbus) PC 샘플**을 만들었습니다. 홀딩 레지스터로 PWM 출력을, 입력 레지스터로 ADC를 읽는 최소 구성이었고, 장착용 캐리어 PCB도 함께 설계했습니다. 검증 결과를 바탕으로 최종 시스템에서는 장치가 늘어나도 쉽게 확장할 수 있는 MQTT 방식을 택했습니다.

## 기술 스택

| 영역 | 내용 |
|------|------|
| 애플리케이션 | C++ (Qt5 Widgets), Linux, systemd |
| 모션 | FASTECH Ezi-SERVO II Plus-E 라이브러리, 3축 폐루프 서보 |
| 펌웨어 | ESP32-S3, FreeRTOS, PCNT 엔코더, PWM, W5500 Ethernet |
| 통신 | MQTT (JSON), Modbus-TCP (PoC), C# NModbus |

## 프로젝트 의의

카메라, 조명, 렌즈, 스테이지가 각각 다른 컨트롤러와 프로토콜로 움직이는 광학 장비를 **메시지 기반 아키텍처로 묶어** 하나의 터치 화면에서 운용할 수 있게 했습니다. 산업용 서보 연동, MCU 펌웨어, Linux 애플리케이션을 함께 다루는 장비 통합 역량을 보여주는 사례입니다.
