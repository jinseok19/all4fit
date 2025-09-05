// UI 유틸리티 및 컴포넌트 헬퍼
export class UIComponents {
  // 토스트 알림
  static showToast(message, type = 'info', duration = 3000) {
    const container = this.getToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span class="toast-message">${message}</span>
      <button class="toast-close" aria-label="닫기">&times;</button>
    `;
    
    // 닫기 버튼 이벤트
    toast.querySelector('.toast-close').addEventListener('click', () => {
      this.removeToast(toast);
    });
    
    container.appendChild(toast);
    
    // 애니메이션을 위한 지연
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });
    
    // 자동 제거
    setTimeout(() => {
      this.removeToast(toast);
    }, duration);
    
    return toast;
  }
  
  static removeToast(toast) {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }
  
  static getToastContainer() {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    return container;
  }

  // 모달 관리
  static showModal(content, options = {}) {
    const { title = '', size = 'medium', closable = true } = options;
    
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal modal-${size}">
        ${title ? `
          <div class="modal-header">
            <h3 class="modal-title">${title}</h3>
            ${closable ? '<button class="modal-close" aria-label="닫기">&times;</button>' : ''}
          </div>
        ` : ''}
        <div class="modal-body">
          ${typeof content === 'string' ? content : content.outerHTML}
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    // 포커스 트랩
    this.trapFocus(overlay);
    
    // 이벤트 리스너
    const closeModal = () => {
      overlay.classList.remove('active');
      setTimeout(() => {
        if (overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
        document.body.style.overflow = '';
      }, 300);
    };
    
    if (closable) {
      const closeBtn = overlay.querySelector('.modal-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
      }
      
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          closeModal();
        }
      });
      
      document.addEventListener('keydown', function escapeHandler(e) {
        if (e.key === 'Escape') {
          closeModal();
          document.removeEventListener('keydown', escapeHandler);
        }
      });
    }
    
    // 스크롤 방지
    document.body.style.overflow = 'hidden';
    
    // 활성화
    requestAnimationFrame(() => {
      overlay.classList.add('active');
    });
    
    return { overlay, close: closeModal };
  }

  // 포커스 트랩 (접근성)
  static trapFocus(element) {
    const focusableElements = element.querySelectorAll(
      'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex="0"]'
    );
    
    if (focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    // 첫 번째 요소에 포커스
    firstElement.focus();
    
    element.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    });
  }

  // 로딩 상태
  static showLoading(target, text = '로딩 중...') {
    const loader = document.createElement('div');
    loader.className = 'loading-state';
    loader.innerHTML = `
      <div class="loading-spinner"></div>
      <p>${text}</p>
    `;
    
    target.innerHTML = '';
    target.appendChild(loader);
    return loader;
  }

  // 빈 상태
  static showEmpty(target, message = '데이터가 없습니다.', actionButton = null) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.innerHTML = `
      <div class="empty-icon">📭</div>
      <p class="empty-message">${message}</p>
      ${actionButton ? actionButton.outerHTML : ''}
    `;
    
    target.innerHTML = '';
    target.appendChild(empty);
    return empty;
  }

  // 에러 상태
  static showError(target, message = '오류가 발생했습니다.', retry = null) {
    const error = document.createElement('div');
    error.className = 'error-state';
    error.innerHTML = `
      <div class="error-icon">⚠️</div>
      <p class="error-message">${message}</p>
      ${retry ? '<button class="btn btn-primary retry-btn">다시 시도</button>' : ''}
    `;
    
    if (retry) {
      error.querySelector('.retry-btn').addEventListener('click', retry);
    }
    
    target.innerHTML = '';
    target.appendChild(error);
    return error;
  }

  // 페이지네이션
  static renderPagination(container, pagination, onPageChange) {
    const { page, pages, hasNext, hasPrev } = pagination;
    
    if (pages <= 1) {
      container.innerHTML = '';
      return;
    }
    
    let html = '<div class="pagination">';
    
    // 이전 버튼
    html += `<button class="pagination-btn ${!hasPrev ? 'disabled' : ''}" data-page="${page - 1}" ${!hasPrev ? 'disabled' : ''}>‹ 이전</button>`;
    
    // 페이지 번호들
    const startPage = Math.max(1, page - 2);
    const endPage = Math.min(pages, page + 2);
    
    if (startPage > 1) {
      html += '<button class="pagination-btn" data-page="1">1</button>';
      if (startPage > 2) {
        html += '<span class="pagination-dots">...</span>';
      }
    }
    
    for (let i = startPage; i <= endPage; i++) {
      html += `<button class="pagination-btn ${i === page ? 'active' : ''}" data-page="${i}">${i}</button>`;
    }
    
    if (endPage < pages) {
      if (endPage < pages - 1) {
        html += '<span class="pagination-dots">...</span>';
      }
      html += `<button class="pagination-btn" data-page="${pages}">${pages}</button>`;
    }
    
    // 다음 버튼
    html += `<button class="pagination-btn ${!hasNext ? 'disabled' : ''}" data-page="${page + 1}" ${!hasNext ? 'disabled' : ''}>다음 ›</button>`;
    
    html += '</div>';
    
    container.innerHTML = html;
    
    // 이벤트 리스너
    container.addEventListener('click', (e) => {
      if (e.target.classList.contains('pagination-btn') && !e.target.disabled) {
        const newPage = parseInt(e.target.dataset.page);
        onPageChange(newPage);
      }
    });
  }

  // 탭 초기화
  static initTabs(container) {
    const tabBtns = container.querySelectorAll('.tab-btn');
    const tabContents = container.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetId = e.target.dataset.tab;
        
        // 모든 탭 비활성화
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        // 선택된 탭 활성화
        e.target.classList.add('active');
        const targetContent = container.querySelector(`#${targetId}`);
        if (targetContent) {
          targetContent.classList.add('active');
        }
      });
    });
  }

  // 아코디언 초기화
  static initAccordion(container) {
    const triggers = container.querySelectorAll('.accordion-trigger');
    
    triggers.forEach(trigger => {
      trigger.addEventListener('click', () => {
        const expanded = trigger.getAttribute('aria-expanded') === 'true';
        
        // 다른 아이템들 닫기 (단일 확장 모드)
        triggers.forEach(t => {
          t.setAttribute('aria-expanded', 'false');
          const content = t.nextElementSibling;
          if (content) content.style.display = 'none';
        });
        
        // 현재 아이템 토글
        if (!expanded) {
          trigger.setAttribute('aria-expanded', 'true');
          const content = trigger.nextElementSibling;
          if (content) content.style.display = 'block';
        }
      });
    });
  }

  // 검색 디바운싱
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // 스크롤 스로틀링
  static throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // 폼 검증
  static validateForm(form, rules) {
    const errors = {};
    const formData = new FormData(form);
    
    Object.entries(rules).forEach(([field, rule]) => {
      const value = formData.get(field)?.toString().trim() || '';
      
      if (rule.required && !value) {
        errors[field] = '필수 입력 항목입니다.';
        return;
      }
      
      if (rule.minLength && value.length < rule.minLength) {
        errors[field] = `최소 ${rule.minLength}자 이상 입력해주세요.`;
        return;
      }
      
      if (rule.pattern && !rule.pattern.test(value)) {
        errors[field] = rule.message || '올바른 형식으로 입력해주세요.';
        return;
      }
    });
    
    // 에러 표시
    this.clearFormErrors(form);
    Object.entries(errors).forEach(([field, message]) => {
      this.showFieldError(form, field, message);
    });
    
    return Object.keys(errors).length === 0;
  }

  static clearFormErrors(form) {
    form.querySelectorAll('.error-message').forEach(el => el.remove());
    form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
  }

  static showFieldError(form, field, message) {
    const input = form.querySelector(`[name="${field}"]`);
    if (input) {
      input.classList.add('error');
      const errorEl = document.createElement('div');
      errorEl.className = 'error-message';
      errorEl.textContent = message;
      input.parentNode.appendChild(errorEl);
    }
  }

  // 이미지 지연 로딩
  static initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          img.addEventListener('load', () => {
            img.classList.add('loaded');
          });
          observer.unobserve(img);
        }
      });
    });
    
    images.forEach(img => imageObserver.observe(img));
  }
}

// 전역으로 사용할 수 있도록 내보냄
export default UIComponents;
