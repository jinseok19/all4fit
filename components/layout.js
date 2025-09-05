import { brand, nav, sitemap, adminNav } from "./site-config.js";

// 테마 토글 함수
function initThemeToggle() {
  const toggle = document.getElementById("themeToggle");
  if (!toggle) return;
  
  const currentTheme = localStorage.getItem("allfit_theme") || "dark";
  document.documentElement.setAttribute("data-theme", currentTheme);
  toggle.setAttribute("aria-pressed", currentTheme === "light");
  
  toggle.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const newTheme = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("allfit_theme", newTheme);
    toggle.setAttribute("aria-pressed", newTheme === "light");
  });
}

// 로그인 상태 확인 및 업데이트
function updateAuthState() {
  const token = localStorage.getItem("allfit_token");
  const loginBtn = document.getElementById("loginBtn");
  const adminLink = document.querySelector('.admin-link');
  
  if (token && loginBtn) {
    loginBtn.textContent = "로그아웃";
    loginBtn.href = "#";
    loginBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      localStorage.removeItem("allfit_token");
      window.location.href = "/";
    });
  }

  // 관리자 링크 클릭 시 이벤트 전파 중단
  if (adminLink) {
    adminLink.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  // 로그인 버튼 클릭 시 이벤트 전파 중단
  if (loginBtn) {
    loginBtn.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }
}

// 전역 검색 초기화
function initGlobalSearch() {
  const searchForm = document.getElementById("globalSearch");
  if (!searchForm) return;
  
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const query = new FormData(e.target).get("q");
    if (query) {
      window.location.href = `/search.html?q=${encodeURIComponent(query)}`;
    }
  });

  // 검색 입력 필드 클릭 시 이벤트 전파 중단
  const searchInput = document.querySelector('.search-input');
  if (searchInput) {
    searchInput.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }
}

// 모바일 메뉴 초기화
function initMobileMenu() {
  const toggle = document.getElementById("mobileMenuToggle");
  const nav = document.querySelector('.primary-nav');
  
  if (!toggle || !nav) return;
  
  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.contains('mobile-open');
    
    if (isOpen) {
      nav.classList.remove('mobile-open');
      toggle.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', '메뉴 열기');
      document.body.classList.remove('mobile-menu-open');
    } else {
      nav.classList.add('mobile-open');
      toggle.classList.add('active');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', '메뉴 닫기');
      document.body.classList.add('mobile-menu-open');
    }
  });

  // 모바일 메뉴 외부 클릭시 닫기
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !toggle.contains(e.target) && nav.classList.contains('mobile-open')) {
      nav.classList.remove('mobile-open');
      toggle.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', '메뉴 열기');
      document.body.classList.remove('mobile-menu-open');
    }
  });

  // ESC 키로 메뉴 닫기
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('mobile-open')) {
      nav.classList.remove('mobile-open');
      toggle.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', '메뉴 열기');
      document.body.classList.remove('mobile-menu-open');
    }
  });
}

export function mountHeader(el, { activePath } = {}) {
  const token = localStorage.getItem("allfit_token");
  
  el.innerHTML = `
    <div class="header">
      <div class="header-content">
        <a class="logo" href="/">
          <span class="logo-icon">${brand.logo}</span>
          <span class="logo-text">${brand.name}</span>
        </a>
        
        <nav class="primary-nav" aria-label="Primary navigation">
          <ul class="nav-list">
            ${nav.map(item => `
              <li class="nav-item ${activePath?.startsWith(item.href) ? "active" : ""}">
                <a href="${item.href}" class="nav-link">${item.label}</a>
              </li>
            `).join("")}
          </ul>
        </nav>
        
        <div class="header-actions">
          <form class="search-form" id="globalSearch" role="search">
            <input type="search" name="q" placeholder="검색..." aria-label="Global search" class="search-input">
            <button type="submit" class="search-btn" aria-label="Search">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="M21 21L16.65 16.65"></path>
              </svg>
            </button>
          </form>
          
          <button id="themeToggle" class="theme-toggle" aria-pressed="false" title="테마 전환">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          </button>
          
          ${token ? `
            <a href="/admin/" class="admin-link ${activePath?.startsWith("/admin/") ? "active" : ""}" title="관리자 대시보드">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L2 7v10c0 5.55 3.84 10 9 11 1.16.21 2.76.21 3.91 0C20.16 27 24 22.55 24 17V7l-10-5z"/>
                <path d="M9 12l2 2 4-4"/>
              </svg>
              <span class="admin-text">관리자</span>
            </a>
          ` : ""}
          
          <button id="mobileMenuToggle" class="mobile-menu-toggle" aria-expanded="false" aria-label="메뉴 열기">
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
          </button>
          
          <a class="btn btn-primary" href="/login.html" id="loginBtn">로그인</a>
        </div>
      </div>
    </div>
  `;
  
  // 초기화 함수들 실행
  requestAnimationFrame(() => {
    initThemeToggle();
    updateAuthState();
    initGlobalSearch();
    initMobileMenu();
  });
}

export function mountFooter(el) {
  el.innerHTML = `
    <div class="footer">
      <div class="footer-content">
        <div class="footer-brand">
          <div class="brand-info">
            <h3>${brand.name}</h3>
            <p>${brand.tagline}</p>
          </div>
        </div>
        
        <div class="footer-sitemap">
          ${sitemap.map(group => `
            <section class="sitemap-section">
              <h4 class="sitemap-title">${group.title}</h4>
              <ul class="sitemap-links">
                ${group.links.map(link => `
                  <li><a href="${link.href}" class="sitemap-link">${link.label}</a></li>
                `).join("")}
              </ul>
            </section>
          `).join("")}
        </div>
        
        <div class="footer-legal">
          <p>&copy; ${new Date().getFullYear()} ${brand.company}. All rights reserved.</p>
          <p>주소: 서울특별시 강남구 테헤란로 123</p>
          <p>전화: 02-1234-5678 | 이메일: contact@nexuscore.co.kr</p>
        </div>
      </div>
    </div>
  `;
}

export function mountBreadcrumb(el, trail = []) {
  if (!trail || trail.length === 0) {
    el.innerHTML = "";
    return;
  }
  
  el.innerHTML = `
    <nav class="breadcrumb" aria-label="Breadcrumb navigation">
      <ol class="breadcrumb-list">
        ${trail.map((item, index) => {
          const isLast = index === trail.length - 1;
          return `
            <li class="breadcrumb-item ${isLast ? "current" : ""}">
              ${item.href && !isLast 
                ? `<a href="${item.href}" class="breadcrumb-link">${item.label}</a>`
                : `<span ${isLast ? 'aria-current="page"' : ''}>${item.label}</span>`
              }
            </li>
          `;
        }).join("")}
      </ol>
    </nav>
  `;
}

// 모바일 네비게이션 토글 (나중에 CSS에서 구현)
export function initMobileNav() {
  const toggle = document.querySelector('[data-mobile-toggle]');
  const nav = document.querySelector('.primary-nav');
  
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('mobile-open');
      toggle.setAttribute('aria-expanded', nav.classList.contains('mobile-open'));
    });
  }
}
