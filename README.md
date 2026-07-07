# New-drygo · Newcomer Journey (목업)

의식주컴퍼니 오피스 신규입사자의 3개월 온보딩 Journey를 한눈에 보는 대시보드 목업입니다.
지금 버전은 **프론트엔드 목업**으로, 데이터는 저장되지 않고 새로고침하면 초기 상태로 돌아갑니다.

## 로컬에서 실행하기

```bash
npm install
npm run dev
```

터미널에 뜨는 `http://localhost:5173` 주소를 브라우저로 열면 됩니다.

## 팀원들이 URL로 바로 열어보게 하려면 (배포)

가장 간단한 방법은 두 가지입니다.

### 방법 1) GitHub Pages (무료, 정적 배포)

1. 저장소 설정에서 GitHub Pages를 켤 필요 없이, 아래 명령으로 배포합니다.

```bash
npm install
npm run build
npm run deploy
```

   (`package.json`에 `deploy` 스크립트가 없다면 아래를 `scripts`에 추가하세요)

```json
"deploy": "gh-pages -d dist"
```

2. 몇 분 후 다음 주소에서 접속 가능합니다:
   `https://hrjo-sys.github.io/Newcomer-Journey/`

3. 저장소 Settings → Pages에서 `gh-pages` 브랜치가 소스로 선택되어 있는지 한 번 확인하세요.

### 방법 2) Vercel (더 쉬움, 자동 배포)

1. https://vercel.com 에서 GitHub 계정으로 로그인
2. "Add New → Project" → `Newcomer-Journey` 저장소 선택 → Deploy 클릭
3. 몇십 초 후 `https://newcomer-journey-xxxx.vercel.app` 같은 URL이 자동 생성되고,
   이후 GitHub에 push할 때마다 자동으로 재배포됩니다.

팀 내부용이면 Vercel 쪽이 설정이 거의 없어서 더 편합니다.

## 프로젝트 구조

```
├── index.html          # 엔트리 HTML (Tailwind CDN 포함)
├── src/
│   ├── main.jsx         # React 진입점
│   └── App.jsx          # 전체 대시보드 컴포넌트 (Home / 신규추가 / Journey수정 / Result / Journey모아보기)
├── package.json
└── vite.config.js
```

## 알려진 제약 (목업 단계)

- 데이터 저장/영속화 없음 (새로고침 시 더미 데이터로 초기화)
- Journey 보기, Journey 모아보기 상세 화면은 스텁 상태
- 필드 관리 화면 미구현
