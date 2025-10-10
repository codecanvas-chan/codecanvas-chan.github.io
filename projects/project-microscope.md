# 현미경 회전 제어 시스템

## 프로젝트 개요
**클라이언트**: 주식회사 와이시스템
**프로젝트명**: 현미경 원격 회전 제어 시스템  
**프로젝트 기간**: 6개월

네트워크 기반 현미경 자동 회전 제어 시스템 개발

---

## 요구사항

### 1. 기본 요구사항
1. 원하는 각도로 현미경을 회전시켜야 한다.
2. 버튼 2개를 이용해 현미경을 시계/반시계 방향으로 n도 회전한다.
   - 각도(n)는 모터 스펙/요구사항에 따라 달라질 수 있다.

### 2. 원격 제어 요구사항
3. PC를 이용해 현미경을 제어할 수 있다.
4. PC와 Target Board는 Ethernet 통신을 한다.
5. Target Board와 TCP/IP 통신을 이용해 현미경을 시계/반시계 방향으로 n도 회전한다.
   - 각도(n)는 모터 스펙/요구사항에 따라 달라질 수 있다.
   - TCP/IP 통신은 요구사항에 따라 유선/무선으로 달라질 수 있다.

### 3. 확장성 요구사항
6. PC 프로그램과의 확장성을 고려한다.
   - 통신 프로토콜을 정의한다.
   - PC GUI 프로그램 개발을 위해 사용할 수 있는 PC Sample Code를 개발한다.
   - PC Sample Code는 C#으로 개발한다.

---

## 시스템 구성

### 하드웨어 구성
```
[PC] (Windows + C# App)
  ↓ Ethernet (TCP/IP)
[ESP32-WROOM-32] (WiFi/Ethernet)
  ├─ [Button 1] (시계방향)
  ├─ [Button 2] (반시계방향)
  ├─ [Motor Driver]
  └─ [Stepper Motor] → [현미경]
```

### 전원 구성
- **입력 전원**: +3.3V DC (ESP32용)
- **모터 전원**: 6V DC (모터 사양에 따라 조정 가능)
- **전원 공급**: 외부 어댑터 또는 PoE (Network Module 사용 시)

---

## 기술 스택

### Target Board (Firmware)
- **MCU**: ESP32-WROOM-32
  - Dual-core Xtensa 32-bit LX6
  - WiFi (802.11 b/g/n)
  - Bluetooth 4.2
  - GPIO, UART, SPI, I2C 지원
  
- **개발 환경**:
  - Arduino IDE 또는 ESP-IDF
  - C/C++
  
- **통신**:
  - Ethernet (LAN8720 Network Module 사용)
  - WiFi (ESP32 내장)
  - TCP/IP Socket Programming

### PC Application (C#)
- **플랫폼**: Windows (.NET Framework 또는 .NET Core)
- **언어**: C#
- **UI**: Windows Forms 또는 WPF
- **통신**: System.Net.Sockets (TCP Client)

### 모터 제어
- **모터 타입**: 스테핑 모터 (Stepper Motor)
- **드라이버**: 범용 스테핑 모터 드라이버
- **제어 방식**: Step/Direction 또는 Phase Control

---

## 회로도

### 시스템 연결도
```
                  ESP32-WROOM-32
                  ┌─────────────┐
[Button1] ───────→│ GPIO 입력   │
[Button2] ───────→│ GPIO 입력   │
                  │             │
          ┌──────→│ GPIO 출력   │──→ Motor Driver
          │       │             │      (Step)
          │ ┌────→│ GPIO 출력   │──→ Motor Driver
          │ │     │             │      (Direction)
          │ │     │             │
[Motor]←──┴─┴─────│ 전원 출력   │
                  │             │
[Ethernet] ←─────→│ LAN8720     │
                  │ Network     │
                  │ Module      │
                  └─────────────┘
                       ↓
                    [3.3V]
                    [GND]
```

### 핀 배치 (예시)
| 핀 | 기능 | 연결 |
|---|---|---|
| GPIO 16 | Button 1 | 시계방향 회전 버튼 |
| GPIO 17 | Button 2 | 반시계방향 회전 버튼 |
| GPIO 18 | Motor Step | 모터 드라이버 Step 신호 |
| GPIO 19 | Motor Direction | 모터 드라이버 방향 신호 |
| GPIO 23 | EMAC MDC | LAN8720 MDC |
| GPIO 18 | EMAC MDIO | LAN8720 MDIO |
| GPIO 19 | EMAC TXD0 | LAN8720 TXD0 |
| GPIO 22 | EMAC TXD1 | LAN8720 TXD1 |

※ 실제 핀 배치는 모터 및 네트워크 모듈 사양에 따라 조정

---

## 통신 프로토콜

### TCP/IP 서버/클라이언트 구조
- **ESP32**: TCP 서버 (포트 8888)
- **PC**: TCP 클라이언트

### 명령 프로토콜

#### 메시지 형식
```
[STX][CMD][ANGLE][ETX][CHECKSUM]

STX: 0x02 (시작 바이트)
CMD: 1byte (명령 코드)
ANGLE: 2bytes (회전 각도, Little Endian)
ETX: 0x03 (종료 바이트)
CHECKSUM: 1byte (XOR checksum)
```

#### 명령 코드
| CMD | 명령 | 설명 |
|-----|------|------|
| 0x01 | ROTATE_CW | 시계방향 회전 |
| 0x02 | ROTATE_CCW | 반시계방향 회전 |
| 0x03 | STOP | 정지 |
| 0x04 | GET_STATUS | 상태 조회 |
| 0x05 | RESET | 리셋 |

#### 응답 형식
```
[STX][STATUS][DATA][ETX][CHECKSUM]

STATUS: 1byte (상태 코드)
  0x00: 성공
  0x01: 실패
  0x02: 진행 중
  
DATA: 가변 길이 (상태에 따라 다름)
```

#### 예시
**시계방향 45도 회전 명령**
```
Send: 0x02 0x01 0x2D 0x00 0x03 0x2C
      [STX][CW] [45° ][ETX][CHK]

Recv: 0x02 0x00 0x03 0x01
      [STX][OK] [ETX][CHK]
```

---

## 필요 업무 및 공수

| 업무 | 내용 | 공수 |
|------|------|------|
| H/W 선정 | Target Board 및 Motor 선정 | 0.5 MD |
| 프로토콜 설계 | 통신 프로토콜 정의 및 문서화 | 1 MD |
| Firmware 개발 | ESP32 펌웨어 개발 | 6 MD |
| - Button 제어 | GPIO 인터럽트 처리 | (포함) |
| - Motor 제어 | Step/Dir 신호 생성 | (포함) |
| - Network | TCP/IP 서버 구현 | (포함) |
| - Protocol | 명령 파싱 및 처리 | (포함) |
| PC Sample Code | C# 기반 샘플 애플리케이션 | 3 MD |
| 테스트 | 단위/통합 테스트 | 0.5 MD |
| **총계** | | **11 MD** |

---

## 개발 범위 및 산출물

### 1. Target Board Firmware
- **ESP32 펌웨어**:
  - Button 입력 처리
  - 스테핑 모터 제어
  - TCP/IP 서버
  - 프로토콜 파싱 및 실행
  - 상태 관리

### 2. 프로토콜 문서
- **통신 프로토콜 명세서**:
  - 메시지 포맷 정의
  - 명령 코드 정의
  - 에러 코드 정의
  - 시퀀스 다이어그램

### 3. PC Sample Code
- **C# 샘플 애플리케이션**:
  - TCP 클라이언트 구현
  - 명령 전송 함수
  - 응답 파싱 함수
  - 간단한 테스트 UI (선택 사항)

---

## 주요 기능

### 1. 로컬 제어 (버튼)
- GPIO 인터럽트를 활용한 버튼 입력 처리
- 시계방향/반시계방향 n도 회전

### 2. 원격 제어 (TCP/IP)
- TCP/IP 소켓 서버 구현
- 프로토콜 파싱 및 명령 실행
- 응답 메시지 전송

### 3. 모터 제어
- 각도를 스텝 수로 변환
- 방향 설정 및 스텝 신호 생성
- 정밀한 회전 제어

---

## PC Sample Code (C# 개요)

### MicroscopeController 클래스
- **Connect()**: TCP 연결 수립
- **RotateCW(angle)**: 시계방향 회전 명령
- **RotateCCW(angle)**: 반시계방향 회전 명령
- **BuildCommand()**: 프로토콜 메시지 생성
- **CalculateChecksum()**: XOR 체크섬 계산

샘플 코드는 C# Windows Forms 또는 WPF 기반으로 제공되며, TCP 통신 및 명령 송수신 기능을 포함합니다.

---

## 기술적 특징

### 1. 듀얼 제어 방식
- 로컬 제어: 물리 버튼
- 원격 제어: 네트워크 (유선/무선)

### 2. 정밀 제어
- 스테핑 모터 사용으로 정밀한 각도 제어
- 마이크로스테핑 지원 가능

### 3. 확장성
- 프로토콜 기반 설계
- 추가 명령 쉽게 확장 가능
- 다양한 플랫폼에서 클라이언트 개발 가능

### 4. 안정성
- Checksum을 통한 데이터 무결성 검증
- 에러 처리 및 응답
- 상태 관리

---

## 테스트 계획

### 단위 테스트
- 버튼 입력 처리
- 모터 회전 (시계/반시계)
- 네트워크 연결
- 프로토콜 파싱

### 통합 테스트
- 로컬 버튼 제어
- PC 원격 제어
- 연속 명령 처리
- 에러 상황 처리

### 성능 테스트
- 응답 시간 측정
- 명령 처리 속도
- 네트워크 안정성

---

## 향후 확장 가능성

### 1. 위치 피드백
- 엔코더 추가로 현재 위치 피드백
- 절대 위치 제어

### 2. 자동 스캔
- 자동 회전 스캔 기능
- 이미지 자동 촬영 연동

### 3. 다축 제어
- X/Y/Z 축 추가
- 3D 스캔 기능

### 4. 웹 인터페이스
- WebSocket 기반 실시간 제어
- 브라우저에서 직접 제어

---

## 프로젝트 의의

현미경 자동화 시스템은 연구실이나 산업 현장에서 반복적인 관찰 작업을 효율화하는 데 중요한 역할을 합니다. 본 프로젝트는 간단하면서도 확장 가능한 구조로 설계되어, 향후 다양한 기능을 추가할 수 있는 기반을 제공합니다.

### 적용 분야
- 연구실 자동화
- 품질 검사 자동화
- 교육용 원격 실험
- 텔레메디신 (원격 진료)