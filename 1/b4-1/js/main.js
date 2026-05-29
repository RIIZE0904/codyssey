/* ============================================================
   main.js — 포트폴리오 인터랙션 전체 담당
   핵심 흐름: 사용자 이벤트 → 상태 변경 → DOM 업데이트
   ============================================================ */

/* ===== DOM 선택 도우미 ===== */
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

/* ===== 프로필 이미지 에러 핸들링 =====
   이미지 파일이 없거나 로드에 실패하면 플레이스홀더를 보여준다.
   ============================================================ */
const profileImg = $('#profile-img');
const profilePlaceholder = $('#profile-placeholder');

if (profileImg && profilePlaceholder) {
  profileImg.addEventListener('error', () => {
    profileImg.classList.add('hidden');
    profilePlaceholder.classList.remove('hidden');
  });
}

/* ===== 다크 모드 토글 =====
   상태: currentTheme
   저장: localStorage
   렌더링: html[data-theme] + 아이콘 + aria-pressed 변경
   ============================================================ */
const root = document.documentElement;
const darkToggle = $('#dark-toggle');
const darkToggleIcon = darkToggle?.querySelector('i');

let currentTheme = localStorage.getItem('theme') || 'light';

const applyTheme = () => {
  root.setAttribute('data-theme', currentTheme);

  const isDark = currentTheme === 'dark';
  darkToggle?.setAttribute('aria-pressed', String(isDark));

  if (darkToggleIcon) {
    darkToggleIcon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
  }
};

applyTheme();

darkToggle?.addEventListener('click', () => {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme', currentTheme);
  applyTheme();
});

/* ===== 햄버거 메뉴 =====
   모바일에서 메뉴 상태를 active 클래스로 관리한다.
   ============================================================ */
const hamburger = $('#hamburger');
const navMenu = $('#nav-menu');

const closeMobileMenu = () => {
  hamburger?.classList.remove('active');
  navMenu?.classList.remove('active');
  hamburger?.setAttribute('aria-expanded', 'false');
  hamburger?.setAttribute('aria-label', '메뉴 열기');
};

hamburger?.addEventListener('click', () => {
  const isOpen = hamburger.classList.toggle('active');
  navMenu?.classList.toggle('active', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));
  hamburger.setAttribute('aria-label', isOpen ? '메뉴 닫기' : '메뉴 열기');
});

$$('.nav__link').forEach((link) => {
  link.addEventListener('click', closeMobileMenu);
});

/* ===== 스크롤 이벤트 =====
   60px 이상: 네비게이션 스타일 변경
   300px 이상: 스크롤 탑 버튼 표시
   ============================================================ */
const header = $('#header');
const scrollTopBtn = $('#scroll-top');

const handleScroll = () => {
  const scrollY = window.scrollY;
  header?.classList.toggle('scrolled', scrollY >= 60);
  scrollTopBtn?.classList.toggle('hidden', scrollY < 300);
};

window.addEventListener('scroll', handleScroll);
handleScroll();

scrollTopBtn?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ===== 스크롤 애니메이션 =====
   threshold 0.2: 요소가 20% 이상 보이면 visible 클래스 추가
   ============================================================ */
const animateElements = $$('.animate-on-scroll');

const scrollObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        scrollObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2 }
);

animateElements.forEach((element) => scrollObserver.observe(element));

/* ===== GitHub API 연동 =====
   로딩 → 성공 / 에러 / 빈 상태를 UI로 표현한다.
   ============================================================ */
const GITHUB_USERNAME = 'RIIZE0904';

const projectsGrid = $('#projects-grid');
const statusLoading = $('#status-loading');
const statusError = $('#status-error');
const statusEmpty = $('#status-empty');
const retryBtn = $('#retry-btn');

const showStatus = (status) => {
  statusLoading?.classList.add('hidden');
  statusError?.classList.add('hidden');
  statusEmpty?.classList.add('hidden');
  projectsGrid?.classList.add('hidden');

  if (status === 'loading') statusLoading?.classList.remove('hidden');
  if (status === 'error') statusError?.classList.remove('hidden');
  if (status === 'empty') statusEmpty?.classList.remove('hidden');
  if (status === 'success') projectsGrid?.classList.remove('hidden');
};

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const createProjectCard = ({
  name,
  description,
  stargazers_count: stars,
  language,
  html_url: htmlUrl,
  updated_at: updatedAt,
}) => {
  const updatedDate = new Date(updatedAt).toLocaleDateString('ko-KR');
  const safeName = escapeHtml(name);
  const safeDescription = escapeHtml(description || '설명이 없습니다.');
  const safeLanguage = language ? escapeHtml(language) : '';
  const safeUrl = escapeHtml(htmlUrl);

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
    const response = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=12`
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const repos = await response.json();
    const ownRepos = repos.filter((repo) => !repo.fork);

    if (ownRepos.length === 0) {
      showStatus('empty');
      return;
    }

    projectsGrid.innerHTML = ownRepos.map(createProjectCard).join('');
    showStatus('success');
  } catch (error) {
    console.error('GitHub API 오류:', error);
    showStatus('error');
  }
};

retryBtn?.addEventListener('click', fetchProjects);
fetchProjects();

/* ===== 폼 유효성 검사 =====
   submit → 값 검사 → 에러 표시 또는 성공 메시지 표시
   ============================================================ */
const contactForm = $('#contact-form');
const formSuccess = $('#form-success');

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const showFieldError = (fieldId, message) => {
  const field = $(`#${fieldId}`);
  const error = $(`#${fieldId}-error`);

  field?.classList.add('error');
  field?.setAttribute('aria-invalid', 'true');
  if (error) error.textContent = message;
};

const clearFieldError = (fieldId) => {
  const field = $(`#${fieldId}`);
  const error = $(`#${fieldId}-error`);

  field?.classList.remove('error');
  field?.setAttribute('aria-invalid', 'false');
  if (error) error.textContent = '';
};

['name', 'email', 'message'].forEach((fieldId) => {
  $(`#${fieldId}`)?.addEventListener('input', () => {
    clearFieldError(fieldId);
  });
});

contactForm?.addEventListener('submit', (event) => {
  event.preventDefault();

  const formData = {
    name: $('#name')?.value.trim() || '',
    email: $('#email')?.value.trim() || '',
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
    showFieldError('email', '올바른 이메일 형식을 입력해주세요.');
    hasError = true;
  }

  if (!message) {
    showFieldError('message', '메시지를 입력해주세요.');
    hasError = true;
  }

  if (hasError) return;

  contactForm.reset();
  formSuccess?.classList.remove('hidden');

  setTimeout(() => {
    formSuccess?.classList.add('hidden');
  }, 3000);
});
