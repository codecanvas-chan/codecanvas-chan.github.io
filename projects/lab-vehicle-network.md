# 차량 네트워크 Lab — OBD-II HUD · C-CAN 스니퍼

## 개요

차량 내부 통신을 직접 읽고 활용하는 개인 프로젝트 두 가지입니다. 하나는 OBD-II로 엔진 데이터를 읽어 보여주는 **라즈베리파이 HUD**이고, 다른 하나는 차량 C-CAN 프레임을 수집해 MQTT로 내보내는 **ESP32 CAN 스니퍼**입니다. 이 경험은 이후 주행 보조 연구의 CAN 연동([edgepilot](project.html?project=edgepilot))으로 이어졌습니다.

## 라즈베리파이 차량 HUD (2021)

- Raspberry Pi 4와 Bluetooth ELM327 어댑터로 **속도, RPM, 엔진 부하, 냉각수 온도**를 실시간으로 표시합니다.
- 제조사 전용 OBD 요청을 써서 디젤 차량의 **DPF(매연 저감 장치) 재생 거리와 온도**처럼 표준 PID에 없는 값까지 읽어 냅니다.
- OBD 통신은 백그라운드 스레드가 맡고, 800×480 전체 화면 PyQt5 UI는 systemd 서비스로 부팅과 동시에 실행됩니다.

## ESP32 C-CAN 스니퍼 (2024)

- ESP32-C3와 MCP2515 CAN 컨트롤러로 차량 C-CAN 프레임을 수집해 **JSON으로 바꿔 MQTT로 발행**합니다.
- Wi-Fi는 캡티브 포털로 설정하고 EEPROM에 저장하며, PC에서는 Python MQTT subscriber가 받은 데이터를 로깅합니다.

## 기술 스택

Raspberry Pi 4 · Python · PyQt5 · python-OBD · ELM327 · ESP32-C3 · MCP2515 · PlatformIO · MQTT

## 기간

2021.12 (HUD) · 2024.01 (CAN 스니퍼)
