// DOM 선택을 짧게 쓰기 위한 헬퍼
// document.querySelector를 매번 쓰기 귀찮아서 $ 하나로 줄임
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);


// 프로필 이미지 로드 실패 처리
// onerror 인라인 이벤트 대신 addEventListener 쓴 이유: HTML과 JS 역할을 분리하기 위해
const profileImg = $('#profile-img');
const profilePlaceholder = $('#profile-placeholder');

if (profileImg && profilePlaceholder) {
  profileImg.addEventListener('error', () => {
    profileImg.classList.add('hidden');            // 이미지 숨기고
    profilePlaceholder.classList.remove('hidden'); // 아이콘 플레이스홀더 보여줌
  });
}


// 다크 모드
// localStorage에 저장해두면 새로고침해도 설정이 유지됨
const root = document.documentElement; // html 요소 - data-theme 속성을 여기에 붙임
const darkToggle = $('#dark-toggle');
const darkToggleIcon = darkToggle?.querySelector('i');

// 저장된 값 있으면 그 값, 없으면 기본값 light
let currentTheme = localStorage.getItem('theme') || 'light';

const applyTheme = () => {
  // html 요소의 data-theme을 바꾸면 CSS [data-theme="dark"] 변수가 자동으로 적용됨
  root.setAttribute('data-theme', currentTheme);

  const isDark = currentTheme === 'dark';

  // 스크린리더에게 버튼의 현재 상태(눌림/안 눌림) 알려줌
  darkToggle?.setAttribute('aria-pressed', String(isDark));

  if (darkToggleIcon) {
    // 다크 모드면 해 아이콘, 라이트 모드면 달 아이콘
    darkToggleIcon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
  }
};

// 페이지 로드 직후 저장된 테마 적용
applyTheme();

darkToggle?.addEventListener('click', () => {
  // 클릭할 때마다 dark ↔ light 전환
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme', currentTheme); // 변경값 저장
  applyTheme();
});


// 햄버거 메뉴
// 모바일에서 내비게이션 메뉴를 여닫는 토글
const hamburger = $('#hamburger');
const navMenu = $('#nav-menu');

const closeMobileMenu = () => {
  hamburger?.classList.remove('active');
  navMenu?.classList.remove('active');
  hamburger?.setAttribute('aria-expanded', 'false');
  hamburger?.setAttribute('aria-label', '메뉴 열기');
};

hamburger?.addEventListener('click', () => {
  // toggle()은 없으면 추가하고 있으면 제거하면서, 현재 상태를 boolean으로 반환
  const isOpen = hamburger.classList.toggle('active');
  navMenu?.classList.toggle('active', isOpen);
  // 접근성 속성도 같이 업데이트
  hamburger.setAttribute('aria-expanded', String(isOpen));
  hamburger.setAttribute('aria-label', isOpen ? '메뉴 닫기' : '메뉴 열기');
});

// 메뉴 링크 클릭 시 모바일 메뉴 자동으로 닫기
$$('.nav__link').forEach((link) => {
  link.addEventListener('click', closeMobileMenu);
});


// 스크롤 이벤트
// 스크롤 위치에 따라 헤더 스타일과 스크롤 탑 버튼 표시 여부를 변경
const header = $('#header');
const scrollTopBtn = $('#scroll-top');

const handleScroll = () => {
  const scrollY = window.scrollY;

  // 60px 넘으면 헤더에 그림자 추가 - 콘텐츠와 시각적으로 구분됨
  header?.classList.toggle('scrolled', scrollY >= 60);

  // 300px 넘으면 스크롤 탑 버튼 나타남 - 너무 빨리 나오면 거슬리니까 300으로 설정
  scrollTopBtn?.classList.toggle('hidden', scrollY < 300);
};

window.addEventListener('scroll', handleScroll);
handleScroll(); // 페이지 로드 시 현재 스크롤 위치 기준으로 한 번 실행

scrollTopBtn?.addEventListener('click', () => {
  // behavior:'smooth'로 부드럽게 맨 위로 이동
  window.scrollTo({ top: 0, behavior: 'smooth' });
});


// 스크롤 애니메이션
// 요소가 화면에 20% 이상 들어오면 visible 클래스를 붙여서 CSS 애니메이션 실행
const animateElements = $$('.animate-on-scroll');

const scrollObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // 한 번 실행되면 다시 감시할 필요 없으니까 해제
        scrollObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2 } // 요소의 20%가 보일 때 실행
);

animateElements.forEach((element) => scrollObserver.observe(element));


// GitHub API 연동
// RIIZE0904 계정의 공개 저장소를 불러와서 Projects 섹션에 카드로 렌더링
const GITHUB_USERNAME = 'RIIZE0904';

const projectsGrid = $('#projects-grid');
const statusLoading = $('#status-loading');
const statusError = $('#status-error');
const statusEmpty = $('#status-empty');
const retryBtn = $('#retry-btn');

// loading / success / error / empty 중 하나만 보이도록 상태 전환
const showStatus = (status) => {
  // 일단 전부 숨기고
  statusLoading?.classList.add('hidden');
  statusError?.classList.add('hidden');
  statusEmpty?.classList.add('hidden');
  projectsGrid?.classList.add('hidden');

  // 해당 상태만 열기
  if (status === 'loading') statusLoading?.classList.remove('hidden');
  if (status === 'error')   statusError?.classList.remove('hidden');
  if (status === 'empty')   statusEmpty?.classList.remove('hidden');
  if (status === 'success') projectsGrid?.classList.remove('hidden');
};

// API에서 받은 값을 HTML에 그대로 넣으면 XSS 공격 가능 - 특수문자 이스케이프 처리
const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

// 저장소 데이터 하나를 받아서 카드 HTML 문자열 반환
const createProjectCard = ({
  name,
  description,
  stargazers_count: stars,
  language,
  html_url: htmlUrl,
  updated_at: updatedAt,
}) => {
  // 날짜를 한국 형식(2026. 1. 5.)으로 변환
  const updatedDate = new Date(updatedAt).toLocaleDateString('ko-KR');

  // 외부 데이터는 전부 이스케이프 처리 - 신뢰할 수 없는 값이라서
  const safeName        = escapeHtml(name);
  const safeDescription = escapeHtml(description || '설명이 없습니다.');
  const safeLanguage    = language ? escapeHtml(language) : '';
  const safeUrl         = escapeHtml(htmlUrl);

  return `
    <article class="project-card">
      <div class="project-card__header">
        <i class="fas fa-code-branch" aria-hidden="true"></i>
        <h3 class="project-card__name">${safeName}</h3>
      </div>
      <p class="project-card__desc">${safeDescription}</p>
      <div class="project-card__meta">
        ${safeLanguage ? `<span><span class="lang-dot"></span>${safeLanguage}</span>` : ''}
        <span><i class="fas fa-star" aria-hidden="true"></i> ${stars}</span>
        <span><i class="fas fa-clock" aria-hidden="true"></i> ${updatedDate}</span>
      </div>
      <a href="${safeUrl}" target="_blank" rel="noopener" class="project-card__link">
        GitHub에서 보기 <i class="fas fa-arrow-right" aria-hidden="true"></i>
      </a>
    </article>
  `;
};

const fetchProjects = async () => {
  showStatus('loading');

  try {
    // 최신 업데이트 순으로 최대 12개 요청 - fork 저장소는 아래서 따로 제외
    const response = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=12`
    );

    // 응답 상태가 200번대가 아니면 에러로 처리
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const repos = await response.json();

    // fork한 저장소는 내 프로젝트가 아니니까 제외
    const ownRepos = repos.filter((repo) => !repo.fork);

    if (ownRepos.length === 0) {
      showStatus('empty');
      return;
    }

    // 각 저장소를 카드 HTML로 변환 후 한 문자열로 합쳐서 한 번에 렌더링
    projectsGrid.innerHTML = ownRepos.map(createProjectCard).join('');
    showStatus('success');

  } catch (error) {
    console.error('GitHub API 오류:', error);
    showStatus('error');
  }
};

// 재시도 버튼 클릭 시 다시 불러오기
retryBtn?.addEventListener('click', fetchProjects);
fetchProjects(); // 페이지 로드 즉시 실행


// 폼 유효성 검사
// 실제 서버 전송 없이 입력값 검사와 성공·에러 메시지 표시만 처리
const contactForm = $('#contact-form');
const formSuccess = $('#form-success');

// 이메일 형식 검사 - @ 앞뒤로 문자가 있고 도메인에 점이 있는지 확인
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// 검사 실패 시 필드에 error 클래스 붙이고 메시지 표시
const showFieldError = (fieldId, message) => {
  const field = $(`#${fieldId}`);
  const error = $(`#${fieldId}-error`);

  field?.classList.add('error');
  field?.setAttribute('aria-invalid', 'true'); // 스크린리더에게 잘못된 입력임을 알림
  if (error) error.textContent = message;
};

// 다시 입력 시작하면 에러 상태 초기화
const clearFieldError = (fieldId) => {
  const field = $(`#${fieldId}`);
  const error = $(`#${fieldId}-error`);

  field?.classList.remove('error');
  field?.setAttribute('aria-invalid', 'false');
  if (error) error.textContent = '';
};

// 각 필드에 input 이벤트 연결 - 타이핑 시작하면 에러 메시지 사라짐
['name', 'email', 'message'].forEach((fieldId) => {
  $(`#${fieldId}`)?.addEventListener('input', () => {
    clearFieldError(fieldId);
  });
});

contactForm?.addEventListener('submit', (event) => {
  // 기본 폼 제출(페이지 이동 또는 서버 전송)을 막고 JS로 직접 처리
  event.preventDefault();

  // trim()으로 앞뒤 공백 제거 - 공백만 입력한 경우도 빈 값으로 처리
  const formData = {
    name:    $('#name')?.value.trim()    || '',
    email:   $('#email')?.value.trim()   || '',
    message: $('#message')?.value.trim() || '',
  };

  const { name, email, message } = formData;
  let hasError = false;

  if (!name) {
    showFieldError('name', '이름을 입력해주세요.');
    hasError = true;
  }

  if (!email) {
    showFieldError('email', '이메일을 입력해주세요.');
    hasError = true;
  } else if (!isValidEmail(email)) {
    // 값은 있지만 형식이 잘못된 경우 - 빈 값과 구분해서 메시지를 다르게
    showFieldError('email', '올바른 이메일 형식을 입력해주세요.');
    hasError = true;
  }

  if (!message) {
    showFieldError('message', '메시지를 입력해주세요.');
    hasError = true;
  }

  // 에러가 하나라도 있으면 여기서 중단
  if (hasError) return;

  contactForm.reset();                       // 폼 초기화
  formSuccess?.classList.remove('hidden');   // 성공 메시지 표시

  // 3초 뒤에 자동으로 숨김
  setTimeout(() => {
    formSuccess?.classList.add('hidden');
  }, 3000);
});
