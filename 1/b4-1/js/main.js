/* ============================================================
   main.js — 포트폴리오 인터랙션 전체 담당
   흐름: 이벤트 → 상태 변경 → DOM 업데이트
   ============================================================ */

/* ===== 다크 모드 토글 =====
   상태: isDark (boolean)
   저장: localStorage → 새로고침 후에도 유지
   렌더링: body.dark 클래스 + 아이콘 교체
   ===================================================== */

const darkToggle = document.getElementById('dark-toggle');
const body = document.body;

// localStorage에서 이전 설정 불러오기 (없으면 라이트 모드)
let isDark = localStorage.getItem('theme') === 'dark';

// 현재 isDark 상태를 화면에 반영하는 함수
const applyTheme = () => {
  if (isDark) {
    body.classList.add('dark');
    darkToggle.querySelector('i').className = 'fas fa-sun';  // 다크 → 태양 아이콘
  } else {
    body.classList.remove('dark');
    darkToggle.querySelector('i').className = 'fas fa-moon'; // 라이트 → 달 아이콘
  }
};

// 초기 테마 적용
applyTheme();

// 이벤트: 버튼 클릭 → 상태 반전 → 저장 → 화면 업데이트
darkToggle.addEventListener('click', () => {
  isDark = !isDark;
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  applyTheme();
});


/* ===== 햄버거 메뉴 =====
   이벤트: 클릭 → active 클래스 토글 → 메뉴 슬라이드다운
   classList.toggle('active') 활용
   ===================================================== */

const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');

// 햄버거 버튼 클릭: 메뉴 열기/닫기
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active'); // X 모양 전환
  navMenu.classList.toggle('active');   // 메뉴 슬라이드다운
});

// 메뉴 링크 클릭 시 자동으로 메뉴 닫기
navMenu.querySelectorAll('.nav__link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
  });
});


/* ===== 스크롤 이벤트 =====
   기준값: 네비 스타일 변경 60px / 스크롤탑 버튼 표시 300px
   이벤트: scroll → 기준값 비교 → 클래스 추가/제거
   ===================================================== */

const header = document.getElementById('header');
const scrollTopBtn = document.getElementById('scroll-top');

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;

  // 네비게이션: 60px 이상 스크롤 시 배경/그림자 추가
  header.classList.toggle('scrolled', scrollY >= 60);

  // 스크롤탑 버튼: 300px 이상 스크롤 시 표시
  scrollTopBtn.classList.toggle('hidden', scrollY < 300);
});

// 스크롤탑 버튼 클릭: 맨 위로 부드럽게 이동
scrollTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});


/* ===== 스크롤 애니메이션 (Intersection Observer) =====
   threshold: 0.2 → 요소가 20% 이상 뷰포트에 들어올 때 트리거
   이벤트: 요소 노출 → .visible 클래스 추가 → CSS 트랜지션 실행
   ===================================================== */

const animateElements = document.querySelectorAll('.animate-on-scroll');

const scrollObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        scrollObserver.unobserve(entry.target); // 한 번 실행 후 감시 해제
      }
    });
  },
  { threshold: 0.2 } // 20% 이상 노출 시 실행
);

animateElements.forEach(el => scrollObserver.observe(el));


/* ===== GitHub API 연동 =====
   엔드포인트: https://api.github.com/users/RIIZE0904/repos
   상태: loading → success / error / empty
   async/await + try/catch 로 비동기 처리
   ===================================================== */

const GITHUB_USERNAME = 'RIIZE0904';

// DOM 요소 참조
const projectsGrid = document.getElementById('projects-grid');
const statusLoading = document.getElementById('status-loading');
const statusError   = document.getElementById('status-error');
const statusEmpty   = document.getElementById('status-empty');
const retryBtn      = document.getElementById('retry-btn');

// 상태별 UI 전환 함수: 현재 상태에 맞는 요소만 표시
const showStatus = (status) => {
  statusLoading.classList.add('hidden');
  statusError.classList.add('hidden');
  statusEmpty.classList.add('hidden');
  projectsGrid.classList.add('hidden');

  if (status === 'loading') statusLoading.classList.remove('hidden');
  if (status === 'error')   statusError.classList.remove('hidden');
  if (status === 'empty')   statusEmpty.classList.remove('hidden');
  if (status === 'success') projectsGrid.classList.remove('hidden');
};

// 프로젝트 카드 HTML 생성 함수 (템플릿 리터럴 활용)
// 구조분해 할당으로 필요한 필드만 추출
const createProjectCard = ({ name, description, stargazers_count, language, html_url, updated_at }) => {
  const updatedDate = new Date(updated_at).toLocaleDateString('ko-KR');
  const desc = description || '설명이 없습니다.';

  return `
    <article class="project-card">
      <div class="project-card__header">
        <i class="fas fa-code-branch"></i>
        <h3 class="project-card__name">${name}</h3>
      </div>
      <p class="project-card__desc">${desc}</p>
      <div class="project-card__meta">
        ${language ? `<span><span class="lang-dot"></span>${language}</span>` : ''}
        <span><i class="fas fa-star"></i> ${stargazers_count}</span>
        <span><i class="fas fa-clock"></i> ${updatedDate}</span>
      </div>
      <a href="${html_url}" target="_blank" rel="noopener" class="project-card__link">
        GitHub에서 보기 <i class="fas fa-arrow-right"></i>
      </a>
    </article>
  `;
};

// GitHub API 호출 함수
const fetchProjects = async () => {
  showStatus('loading');

  try {
    const response = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=12`
    );

    // 403: 레이트 리밋 초과 / 기타 HTTP 오류 처리
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const repos = await response.json();

    // fork된 저장소 제외 (filter 활용)
    const ownRepos = repos.filter(repo => !repo.fork);

    if (ownRepos.length === 0) {
      showStatus('empty');
      return;
    }

    // 각 저장소를 카드 HTML로 변환 (map 활용) → join으로 하나의 문자열로 합치기
    projectsGrid.innerHTML = ownRepos.map(createProjectCard).join('');
    showStatus('success');

  } catch (error) {
    console.error('GitHub API 오류:', error);
    showStatus('error');
  }
};

// 다시 시도 버튼 클릭 이벤트
retryBtn.addEventListener('click', fetchProjects);

// 페이지 로드 시 즉시 호출
fetchProjects();


/* ===== 폼 유효성 검사 =====
   상태: 각 필드별 에러 여부
   이벤트: submit → 검사 → 에러 메시지 표시 or 성공 메시지
   event.preventDefault()로 기본 제출 동작 차단
   ===================================================== */

const contactForm = document.getElementById('contact-form');
const formSuccess  = document.getElementById('form-success');

// 이메일 형식 정규식 검증
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// 필드에 에러 표시: 빨간 테두리 + 에러 메시지
const showFieldError = (fieldId, errorId, message) => {
  document.getElementById(fieldId).classList.add('error');
  document.getElementById(errorId).textContent = message;
};

// 필드 에러 초기화: 테두리 복구 + 메시지 제거
const clearFieldError = (fieldId, errorId) => {
  document.getElementById(fieldId).classList.remove('error');
  document.getElementById(errorId).textContent = '';
};

// 입력 중 실시간 에러 해제 (forEach 활용)
['name', 'email', 'message'].forEach(fieldId => {
  document.getElementById(fieldId).addEventListener('input', () => {
    clearFieldError(fieldId, `${fieldId}-error`);
  });
});

// 폼 제출 처리
contactForm.addEventListener('submit', (event) => {
  event.preventDefault(); // 기본 폼 제출(페이지 리로드) 방지

  // 구조분해 할당으로 입력값 한꺼번에 추출 + 공백 제거
  const { name, email, message } = {
    name:    document.getElementById('name').value.trim(),
    email:   document.getElementById('email').value.trim(),
    message: document.getElementById('message').value.trim(),
  };

  let hasError = false;

  // 이름: 빈 값 검사
  if (!name) {
    showFieldError('name', 'name-error', '이름을 입력해주세요.');
    hasError = true;
  }

  // 이메일: 빈 값 → 형식 검사 순서로 진행
  if (!email) {
    showFieldError('email', 'email-error', '이메일을 입력해주세요.');
    hasError = true;
  } else if (!isValidEmail(email)) {
    showFieldError('email', 'email-error', '올바른 이메일 형식을 입력해주세요.');
    hasError = true;
  }

  // 메시지: 빈 값 검사
  if (!message) {
    showFieldError('message', 'message-error', '메시지를 입력해주세요.');
    hasError = true;
  }

  // 에러가 하나라도 있으면 제출 중단
  if (hasError) return;

  // 모든 검사 통과: 폼 초기화 + 성공 메시지 표시
  contactForm.reset();
  formSuccess.classList.remove('hidden');

  // 3초 후 성공 메시지 자동 숨김
  setTimeout(() => {
    formSuccess.classList.add('hidden');
  }, 3000);
});
