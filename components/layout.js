import { brand, nav, sitemap } from "./site-config.js";

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
  el.innerHTML = `
    <div class="header">
      <div class="header-content">
        <div class="brand-container">
          <a class="nexuscore-home-link" href="https://nexuscore.all4fit.co.kr" title="NexusCore 홈으로">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span>NexusCore</span>
          </a>
          <a class="logo" href="/">
            <span class="logo-icon">${brand.logo}</span>
            <span class="logo-text">${brand.name}</span>
          </a>
        </div>
        
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
          
          <button id="mobileMenuToggle" class="mobile-menu-toggle" aria-expanded="false" aria-label="메뉴 열기">
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
          </button>
        </div>
      </div>
    </div>
  `;
  
  // 초기화 함수들 실행
  requestAnimationFrame(() => {
    initThemeToggle();
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
