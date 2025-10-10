# 토스트 - 임베디드 리눅스용 QT 어플리케이션

## 프로젝트 개요
**클라이언트**: 토스트
**프로젝트명**: 임베디드 리눅스용 QT 어플리케이션 개발
**기간**: 약 2주

차량용 인포테인먼트 시스템 GUI 개발

![차량용 인포테인먼트 시스템 GUI](projects/project-toast_img_01.png)

---

## 기술 스택

### 개발 환경
- **플랫폼**: 임베디드 리눅스
- **프레임워크**: QT/QML
- **언어**: C++, QML
- **QT 버전**: (계약서에 명시되지 않음, 일반적으로 5.x 또는 6.x)

### 크로스 컴파일
- **개발 머신**: 맥북 M2
- **타겟**: 임베디드 리눅스 (ARM 기반 추정)
- **빌드 시스템**: Yocto 또는 커스텀 크로스 컴파일 환경

---

## 주요 기능 영역

### 1. Home Part

#### Home Main
- **화면 구성**:
  - Status Bar (상단)
  - 좌측 위젯 영역 (전화 투영 등)
  - 우측 위젯 영역 (미디어 재생 정보 등)
  - 하단 메뉴 바 (All Menu, Phone, Media, Setup)
  
- **기능**:
  - Loading 화면
  - Phone Projection (Android Auto / Apple CarPlay)
  - Radio/Media 위젯
  - 시계 및 날짜 표시

#### All Menus
- **메뉴 구성**:
  - Phone (전화)
  - Phone Projection (폰 투영)
  - Voice Memo (음성 메모)
  - Radio (라디오)
  - Media (미디어)
  - Road CarPlay (로드 카플레이)
  - Apple CarPlay (애플 카플레이)
  - Setup (설정)

- **메뉴 관리**:
  - Reorder All Menu Icons (아이콘 재배치)
  - Edit Home Icons (홈 아이콘 편집)

#### Widget 관리
- **Edit Right Widget**: 우측 위젯 편집
- **Edit Left Widget**: 좌측 위젯 편집
- **위젯 종류**:
  - Radio/Media (라디오/미디어 재생 정보)
  - Phone Projection (현재 재생 정보)
  - Clock (시계)

#### 다국어 지원
- **Agreement 시스템**:
  - 초기 실행 시 약관 동의
  - 언어 선택 (English / Korean)
  - Confirm / Languages 팝업

#### Power Off
- 전원 끄기 / 디스플레이 끄기
- 디지털 시계 표시

---

### 2. Radio Part

#### Main 화면
- **FM 라디오**:
  - 주파수 표시 (예: 101.1 MHz)
  - 프리셋 목록 (좌측)
  - 재생 제어 (이전/다음 스테이션)
  - 즐겨찾기 (별 아이콘)
  
- **AM 라디오**:
  - 주파수 표시 (예: 530 KHz)
  - 프리셋 목록
  - 재생 제어
  
- **프리셋 없음**:
  - "Presets can be saved..." 안내 메시지

#### 메뉴 기능
- **Options Menu**:
  - Display Off (화면 끄기)
  - Station List (스테이션 목록)
  - Scan All (전체 스캔)
  - Delete Presets (프리셋 삭제)
  - Radio Noise (노이즈 설정)

#### Station List
- **스테이션 관리**:
  - Station List Refresh (목록 새로고침)
  - Loading 상태 표시
  - No Station List (목록 없음)

#### Delete Presets
- **프리셋 삭제**:
  - 체크박스로 프리셋 선택
  - Unmark All / Delete 버튼
  - 삭제 확인 팝업
  - 삭제 완료 팝업

#### OSD (On-Screen Display)
- AM/FM 모드 표시
- 현재 주파수 표시
- 메시지 오버레이

---

### 3. Media Part

#### USB Music
- **Main 화면**:
  - 앨범 아트
  - 곡 정보 (제목, 아티스트)
  - 재생 제어 (이전/재생-일시정지/다음)
  - 재생 시간 (00:00 / 04:48)
  
- **List 뷰**:
  - Files (파일 브라우저)
    - Root Folder
    - Folder 1, 2, 3, 4
    - 계층 구조 탐색
  
  - Artists (아티스트별)
    - 아티스트 목록
    - Artist 1, 2, 3, 4
    - 아티스트별 곡 목록
    - "Play All" 기능
  
  - Songs (곡 목록)
    - 전체 곡 목록
    - Song 1, 2, 3, 4
    - A-Z 인덱스
  
  - Albums (앨범별)
    - 앨범 목록
    - Album 1, 2, 3, 4
    - 앨범별 곡 목록
    - "Unmark All" / "Play" 기능
  
  - Recently Added (최근 추가)
    - 최근 추가된 곡 목록

- **업데이트**:
  - USB Music List Updating
  - "Updating..." 표시

#### Bluetooth Audio
- **Main 화면**:
  - 연결된 기기 정보 (Device Info)
  - 앨범 아트
  - 곡 정보
  - 재생 제어
  
- **Guide 메시지**:
  - "This is a list of songs saved on the connected device. Please select items manually using a button on the screen."

#### Options Menu
- **공통 옵션**:
  - Display Off (화면 끄기)
  - Media Sources (미디어 소스 선택)
  - Songs by this Artist (이 아티스트의 곡)
  - Songs from this Album (이 앨범의 곡)
  - Sound Settings (사운드 설정)

#### Media Gate
- **소스 선택**:
  - Bluetooth Audio
  - USB Music
  - Apple CarPlay
  - Android Auto
  
- **Rearrange icons**: 아이콘 재배치 기능

#### 오류 처리
- **다양한 팝업 메시지**:
  - "Music file does not exist."
  - "File can be found in the .hidden folder in the USB device."
  - "File not hidden. Please check the USB device."
  - "USB is grouped in a different mode. Please try again later."
  - "Hide this file now?"
  - "Processing..." (로딩)

#### OSD
- Title / Hide info / Artist info / 00:00
- 재생 정보 오버레이

---

## 프로젝트 일정

| 단계 | 내용 | 기간 |
|------|------|------|
| 개발 착수 | 요구사항 분석 및 설계 | 1일 |
| Home Part 개발 | 메인 화면, 위젯, 메뉴 | 3일 |
| Radio Part 개발 | FM/AM 라디오 기능 | 3일 |
| Media Part 개발 | USB/Bluetooth 미디어 | 3일 |
| 통합 및 테스트 | 전체 통합, 버그 수정 | 1일 |
| **총 개발 기간** | | **11일** |

검수 기간: 개발 완료 후 60일

---

## 기술적 특징

### 1. QML 기반 UI
- **선언적 UI**: QML의 선언적 문법으로 직관적인 UI 개발
- **애니메이션**: 부드러운 화면 전환 및 애니메이션
- **터치 인터페이스**: 차량용 터치 스크린 최적화

### 2. C++ 백엔드
- **미디어 제어**: GStreamer 또는 QMediaPlayer 활용
- **Bluetooth**: BlueZ 스택 연동
- **USB**: udev를 통한 USB 장치 감지
- **Radio**: FM/AM 튜너 하드웨어 제어

### 3. 크로스 플랫폼
- **맥북 M2**: 개발 환경
- **ARM Linux**: 타겟 플랫폼
- **크로스 컴파일**: 맥 → ARM 리눅스

### 4. 성능 최적화
- **하드웨어 가속**: OpenGL ES를 통한 GPU 가속
- **메모리 관리**: 임베디드 환경에 최적화된 메모리 사용
- **부팅 시간**: 빠른 시작 시간

---

## 납품물

### 1. 소스코드
- QML 파일 (UI)
- C++ 소스 (비즈니스 로직)
- 리소스 파일 (이미지, 폰트 등)

### 2. 개발 문서
- **맥북 M2 개발 환경 구축 설명서**:
  - QT 설치 및 설정
  - 크로스 컴파일 환경 구축
  - 의존성 라이브러리 설치
  
- **임베디드 리눅스용 크로스컴파일 설명서**:
  - 타겟 시스템 사양
  - 빌드 방법
  - 배포 방법

### 3. 실행 바이너리
- 타겟 플랫폼용 컴파일된 바이너리
- 설치 스크립트

---

## 기술적 도전

### 1. 맥북 M2 크로스 컴파일
**도전**: Apple Silicon(ARM64)에서 임베디드 ARM Linux로 크로스 컴파일

**해결**:
- Docker를 활용한 크로스 컴파일 환경
- QEMU를 통한 에뮬레이션 테스트
- 빌드 스크립트 자동화

### 2. 미디어 재생 성능
**도전**: 임베디드 환경에서 부드러운 UI와 미디어 재생

**해결**:
- 하드웨어 디코딩 활용
- QML의 비동기 로딩
- 스레드 분리 (UI / 미디어 처리)

### 3. Bluetooth/USB 핫플러그
**도전**: 동적 장치 연결/해제 처리

**해결**:
- udev 룰 설정
- DBus를 통한 이벤트 처리
- 상태 관리 State Machine

---

## 프로젝트 관리

### 커뮤니케이션
- **정기 미팅**: 주 2회
- **응답 시간**: 요청 후 2영업일 이내
- **미팅 방식**: 온라인 또는 오프라인

---

## 프로젝트 의의

차량용 인포테인먼트 시스템은 현대 자동차의 필수 요소로, 운전자와 승객에게 편의성과 엔터테인먼트를 제공합니다. 본 프로젝트는 QT/QML의 강력한 기능을 활용하여 직관적이고 세련된 UI를 구현하고, 임베디드 리눅스의 안정성과 성능을 결합하여 고품질의 차량용 시스템을 개발했습니다.

### 적용 기술
- Modern C++ (C++11/14/17)
- QML (Qt Meta Language)
- 멀티미디어 프레임워크
- Bluetooth 스택
- 하드웨어 추상화 레이어

### 확장 가능성
- Over-The-Air (OTA) 업데이트
- 클라우드 연동
- AI 음성 비서 통합
- 차량 진단 기능 추가