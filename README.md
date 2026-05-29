# 김현서 포트폴리오 웹사이트

순수 HTML, CSS, JavaScript만으로 제작한 반응형 포트폴리오 웹사이트입니다. 사용자 이벤트가 발생하면 상태가 바뀌고, 그 상태에 따라 DOM이 업데이트되는 흐름을 직접 구현했습니다.

## 배포 URL

- GitHub Pages: 배포 후 이곳에 URL을 입력합니다.

## 사용 기술

- HTML5: 시맨틱 태그, 앵커 네비게이션, 폼 label 연결, 이미지 alt 적용
- CSS3: CSS 변수, Flexbox, Grid, 반응형 레이아웃, 다크 모드, hover/transition 효과
- JavaScript ES6+: `const`, `let`, 화살표 함수, 구조분해 할당, `forEach`, `map`, `filter`, `fetch`, `async/await`, `try/catch`
- GitHub API: 본인 GitHub 저장소 목록 동적 렌더링

## 프로젝트 구조

```text
.
├── index.html
├── css/
│   └── style.css
├── js/
│   └── main.js
├── images/
│   └── profile.png
└── README.md
```

## 주요 기능

### 1. 반응형 포트폴리오 레이아웃

- Hero, About, Journey, Skills, Projects, Contact, Footer 섹션으로 구성했습니다.
- 모바일 퍼스트로 작성한 뒤 `768px`, `1024px` 브레이크포인트에서 태블릿/데스크톱 레이아웃으로 확장했습니다.
- 네비게이션은 Flexbox, 카드 목록은 Grid와 `repeat(auto-fit, minmax(...))`를 사용했습니다.

### 2. 인터랙티브 UI

- 모바일 햄버거 메뉴 토글
- 네비게이션 앵커 링크와 부드러운 스크롤
- 스크롤 60px 이상에서 Header 스타일 변경
- 스크롤 300px 이상에서 Scroll Top 버튼 표시
- Scroll Top 버튼 클릭 시 최상단 이동
- Intersection Observer 기반 스크롤 애니메이션

### 3. 다크 모드

- 다크 모드 버튼 클릭 시 `html[data-theme="dark"]` 속성을 변경합니다.
- 선택한 테마는 `localStorage`에 저장되어 새로고침 후에도 유지됩니다.

### 4. GitHub API 연동

- `fetch`와 `async/await`으로 GitHub 저장소 API를 호출합니다.
- `map`으로 저장소 데이터를 프로젝트 카드 HTML로 변환합니다.
- `filter`로 fork 저장소를 제외합니다.
- 로딩, 성공, 에러, 빈 상태를 UI로 구분해 보여줍니다.
- 에러 상태에서는 다시 시도 버튼을 제공합니다.

### 5. 폼 유효성 검사

- Contact 폼은 이름, 이메일, 메시지를 입력받습니다.
- `submit` 이벤트에서 `event.preventDefault()`로 기본 제출을 막고 직접 검증합니다.
- 빈 필드와 이메일 형식을 검사합니다.
- 에러 메시지는 각 입력 필드 근처에 표시됩니다.
- 입력 중에는 해당 필드의 에러 상태가 해제됩니다.

## 상태 → 렌더링 흐름

1. 다크 모드 토글  
   사용자 클릭 → `currentTheme` 변경 → `localStorage` 저장 → `data-theme` 변경 → 전체 색상 변경

2. GitHub API 호출  
   페이지 로드 또는 재시도 클릭 → 로딩 상태 표시 → API 요청 → 성공/에러/빈 상태에 따라 Projects UI 변경

3. 폼 유효성 검사  
   제출 클릭 → 입력값 검사 → 에러 상태 변경 → 에러 메시지 표시 또는 성공 메시지 표시

4. 스크롤 인터랙션  
   스크롤 발생 → `scrollY` 기준 비교 → Header/Scroll Top 버튼 클래스 변경

## 스크린샷

배포 전 아래 이미지를 추가하면 됩니다.

```text
docs/screenshots/desktop.png
docs/screenshots/mobile.png
docs/screenshots/dark-mode.png
```

## GitHub API 주의사항

인증 없이 GitHub API를 호출하면 시간당 요청 수 제한이 있습니다. 제한이 발생하면 403 응답이 올 수 있으며, 이 경우 에러 상태 UI가 표시됩니다.
