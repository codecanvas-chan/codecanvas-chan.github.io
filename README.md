# 코드캔버스 CodeCanvas — 포트폴리오 사이트

임베디드 시스템 · FPGA · Edge AI 개발 포트폴리오입니다.

🌐 https://codecanvas-chan.github.io/

## 구조

```
├── index.html              # 홈 (서비스 · 프로젝트 · R&D · 진행 방식 · 역량 · 연혁 · 문의)
├── project.html            # 프로젝트 상세 템플릿 (?project=<key>)
├── css/style.css           # 디자인 시스템
├── js/
│   ├── data.js             # ★ 프로젝트 메타데이터 (제목 · 고객사 · 기간 · KPI · 커버 이미지)
│   ├── common.js           # 내비게이션 · 스크롤 애니메이션 · 이미지 확대
│   ├── main.js             # 홈 프로젝트 카드 · 필터 · R&D 렌더링
│   └── project.js          # 상세 페이지 렌더링 (Markdown + 목차)
├── projects/*.md           # 프로젝트 본문 (Markdown + figure HTML)
└── assets/
    ├── diagrams/*.svg      # 시스템 구성도 · 흐름도
    ├── covers/*.svg        # 이미지가 없는 프로젝트용 카드 커버
    ├── img/<project>/      # 스크린샷 · 사진 · 영상 (WebP / MP4)
    └── og-image.png        # 링크 공유 썸네일 (1200×630)
```

## 프로젝트 추가 방법

1. `projects/` 에 본문 Markdown 작성 (`## 제목` 단위로 목차가 자동 생성됩니다)
2. `js/data.js` 의 `projects` 배열에 항목 추가 — `type: 'client'` 는 프로젝트 섹션, `type: 'rnd'` 는 R&D 섹션에 표시
3. 이미지는 `assets/img/<key>/` 에 WebP로 넣고 본문에서 아래처럼 사용

```html
<figure class="fig"><div class="frame pad"><img src="assets/diagrams/xxx.svg" alt="설명"></div>
<figcaption><b>FIG 1</b><span>캡션</span></figcaption></figure>
```

## 로컬 미리보기

```bash
python3 -m http.server 8000
```
