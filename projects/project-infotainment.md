# 차량용 인포테인먼트 HMI 개발 (Qt/QML)

## 프로젝트 개요

자동차 전장 고객사의 차량용 인포테인먼트(IVI) 시스템 화면을 **Qt/QML**로 구현했습니다. 고객사가 준 UX 사양과 디자인 시안을 바탕으로 Home, Radio, Media 세 영역 **58개 화면**의 화면 전환, 팝업, OSD, 리스트 탐색을 **11일 안에** 구현하고, Apple Silicon 개발 환경과 임베디드 리눅스 크로스 컴파일 가이드까지 함께 납품했습니다.

> 고객사와의 비밀유지계약에 따라 고객사명은 공개하지 않습니다.

<div class="highlights">
<div><h4>58개 화면 · 11일 구현</h4><p>Home 20, Radio 12, Media 26개 화면의 레이아웃, 화면 전환, 팝업을 사양 그대로 구현했습니다.</p></div>
<div><h4>시안 기반 인터랙션 구현</h4><p>화면 간 클릭 이동, 옵션 메뉴, 확인·안내 팝업, OSD, 라이브러리 리스트 탐색을 UX 사양에 맞춰 구현했습니다.</p></div>
<div><h4>사용자 커스터마이징</h4><p>홈 위젯 편집, 메뉴 아이콘 재배치, 약관 동의와 언어(EN/KR) 선택 흐름을 구현했습니다.</p></div>
<div><h4>개발 환경 문서화</h4><p>M2 Mac 개발 환경 구축 가이드와 임베디드 리눅스 크로스 컴파일 가이드를 작성해 함께 납품했습니다.</p></div>
</div>

## 구현 화면

<p style="font-size:.9rem;color:var(--text-3)">아래 화면은 고객사 UX 디자인 시안이며, 이를 기준으로 QML 화면과 화면 전환을 구현했습니다.</p>

<div class="fig-grid">
<figure class="fig"><div class="frame dark"><img src="assets/img/infotainment/all-menus.webp" alt="All Menus 화면: Phone, Phone Projection, Voice Memo, Radio, Media, Android Auto, Apple CarPlay, Setup"></div><figcaption><b>MENUS</b><span>전체 메뉴 — 8개 기능 아이콘, 아이콘 재배치 지원</span></figcaption></figure>
<figure class="fig"><div class="frame dark"><img src="assets/img/infotainment/fm-radio.webp" alt="FM 라디오 메인: 프리셋 목록과 주파수 101.1"></div><figcaption><b>RADIO</b><span>FM 라디오 — 프리셋 목록, 주파수 표시, 즐겨찾기, 스캔</span></figcaption></figure>
<figure class="fig"><div class="frame dark"><img src="assets/img/infotainment/usb-music-list.webp" alt="USB Music 라이브러리 Files 탭: 폴더 목록"></div><figcaption><b>LIBRARY</b><span>USB 라이브러리 — Files · Artists · Songs · Albums · Recently Added</span></figcaption></figure>
<figure class="fig"><div class="frame dark"><img src="assets/img/infotainment/media-gate.webp" alt="Media Gate: Bluetooth Audio, USB Music, Apple CarPlay, Android Auto 선택"></div><figcaption><b>MEDIA</b><span>미디어 소스 선택 — Bluetooth · USB · CarPlay · Android Auto</span></figcaption></figure>
</div>

## 화면 구성

<figure class="fig"><div class="frame pad"><img src="assets/diagrams/infotainment-screen-map.svg" alt="인포테인먼트 HMI 화면 구성도: Home, Radio, Media"></div><figcaption><b>FIG 1</b><span>세 영역의 화면 구성과 주요 전환 흐름입니다. 각 영역은 메인 화면, 옵션 메뉴, 리스트, 팝업, OSD로 이루어집니다.</span></figcaption></figure>

### Home
- 로딩 화면 → 홈 메인: 상태바, 좌·우 위젯(Phone Projection, 미디어, 시계), 하단 메뉴 바
- All Menus: Phone, Phone Projection, Voice Memo, Radio, Media, Android Auto, Apple CarPlay, Setup
- 위젯 편집, 아이콘 재배치, 홈 아이콘 편집
- 최초 실행 시 약관 동의와 언어 선택(English / Korean), 디스플레이 OFF 시계 화면

<figure class="fig medium"><div class="frame dark"><img src="assets/img/infotainment/edit-widget.webp" alt="오른쪽 위젯 편집 화면: Radio/Media, Phone Projection, Clock 중 선택"></div><figcaption><b>WIDGET</b><span>홈 위젯 편집 — Radio/Media · Phone Projection · Clock 중 선택</span></figcaption></figure>

### Radio
- FM/AM 메인: 주파수 표시, 프리셋 목록, 이전/다음 스테이션, 즐겨찾기
- 옵션 메뉴: Display Off, Station List, Scan, Delete Presets, Radio Noise
- 스테이션 목록 새로고침과 로딩·빈 목록 상태, 프리셋 다중 선택 삭제와 확인·완료 팝업
- AM/FM과 주파수를 보여주는 OSD

### Media
- Media Gate: Bluetooth Audio, USB Music, Apple CarPlay, Android Auto 소스 선택과 아이콘 재배치
- USB Music: 앨범아트, 곡 정보, 재생 제어, 재생 시간
- 라이브러리: Files(폴더 계층), Artists, Songs(A–Z 인덱스), Albums, Recently Added, 목록 업데이트 중 상태
- Bluetooth Audio: 연결 기기 정보, 기기 변경, 사용 안내
- 오류·안내 팝업 6종과 재생 정보 OSD

## 구현 범위

- 고객사 UX 사양서의 화면 정의와 전환 규칙에 따라 **기능 구동과 화면 간 클릭 이동**을 구현했습니다.
- 디자인 시안(2048×1200)의 레이아웃, 아이콘, 팝업 문구를 QML 화면으로 옮겼습니다.
- Apple Silicon Mac에서 개발·검증하고, 임베디드 리눅스 타깃용 크로스 컴파일 절차를 문서로 정리했습니다.

## 납품물

| 구분 | 내용 |
|------|------|
| 소스 코드 | QML UI, C++ 연동부, 이미지·폰트 리소스 |
| 문서 | M2 Mac 개발 환경 구축 가이드, 임베디드 리눅스 크로스 컴파일 가이드 |
| 검수 | 납품 후 60일 하자 보수 기간 대응 |

## 기술 스택

| 영역 | 내용 |
|------|------|
| 프레임워크 | Qt, QML (Qt Quick), C++ |
| 개발 환경 | Apple Silicon(M2) macOS |
| 타깃 | 임베디드 리눅스 (ARM), 크로스 컴파일 |

## 프로젝트 의의

차량용 HMI는 화면 수가 많고 상태 전이가 복잡해 일정이 쉽게 늘어나는 분야입니다. 이 프로젝트에서는 58개 화면을 11일이라는 짧은 일정 안에 사양대로 구현하고, 고객사가 바로 이어서 개발할 수 있도록 환경 구축·빌드 문서까지 함께 넘겼습니다.
