// 리스트 페이지 공통 기능
import { store } from './store.js';
import UIComponents from './ui.js';

export class ListManager {
  constructor(options = {}) {
    this.type = options.type;
    this.container = options.container;
    this.filters = options.filters || {};
    this.currentPage = 1;
    this.itemsPerPage = options.itemsPerPage || 12;
    this.sortBy = options.sortBy || 'createdAt';
    this.sortOrder = options.sortOrder || 'desc';
    this.searchQuery = '';
    
    this.init();
  }

  async init() {
    await this.setupFilters();
    await this.setupSearch();
    await this.loadAndRender();
  }

  // 필터 설정
  async setupFilters() {
    const filtersContainer = this.container.querySelector('.filters');
    if (!filtersContainer) return;

    // 필터 변경 이벤트
    filtersContainer.addEventListener('change', this.debounce(() => {
      this.handleFilterChange();
    }, 300));
  }

  // 검색 설정
  async setupSearch() {
    const searchInput = this.container.querySelector('.search-input');
    if (!searchInput) return;

    searchInput.addEventListener('input', this.debounce((e) => {
      this.searchQuery = e.target.value.trim();
      this.currentPage = 1;
      this.loadAndRender();
    }, 500));
  }

  // 필터 변경 처리
  handleFilterChange() {
    const filtersContainer = this.container.querySelector('.filters');
    const formData = new FormData(filtersContainer);
    
    this.filters = {};
    for (let [key, value] of formData.entries()) {
      if (value && value !== 'all') {
        this.filters[key] = value;
      }
    }
    
    this.currentPage = 1;
    this.loadAndRender();
  }

  // 정렬 변경
  handleSort(sortBy, order) {
    this.sortBy = sortBy;
    this.sortOrder = order;
    this.loadAndRender();
  }

  // 데이터 로드 및 렌더링
  async loadAndRender() {
    const listContainer = this.container.querySelector('.list-container');
    const paginationContainer = this.container.querySelector('.pagination-container');
    
    try {
      UIComponents.showLoading(listContainer);

      // 데이터 가져오기
      let data;
      if (this.searchQuery) {
        data = await store.search(this.type, this.searchQuery);
      } else {
        data = await store.getData(this.type);
      }

      // 필터 적용
      data = data.filter(item => this.applyFilters(item, this.filters));

      // 정렬
      data = this.applySorting(data);

      // 페이지네이션
      const result = store.paginate(data, this.currentPage, this.itemsPerPage);

      if (result.data.length === 0) {
        const emptyMessage = this.searchQuery 
          ? `"${this.searchQuery}"에 대한 검색 결과가 없습니다.`
          : '등록된 항목이 없습니다.';
        
        UIComponents.showEmpty(listContainer, emptyMessage);
        paginationContainer && (paginationContainer.innerHTML = '');
        return;
      }

      // 리스트 렌더링
      this.renderList(listContainer, result.data);

      // 페이지네이션 렌더링
      if (paginationContainer) {
        UIComponents.renderPagination(paginationContainer, result.pagination, (page) => {
          this.currentPage = page;
          this.loadAndRender();
        });
      }

    } catch (error) {
      console.error('Load data error:', error);
      UIComponents.showError(listContainer, '데이터를 불러오는 중 오류가 발생했습니다.', () => {
        this.loadAndRender();
      });
    }
  }

  // 필터 적용
  applyFilters(item, filters) {
    return Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      
      const itemValue = this.getNestedValue(item, key);
      
      if (Array.isArray(itemValue)) {
        return itemValue.some(v => String(v).toLowerCase().includes(String(value).toLowerCase()));
      }
      
      return String(itemValue).toLowerCase().includes(String(value).toLowerCase());
    });
  }

  // 정렬 적용
  applySorting(data) {
    return data.sort((a, b) => {
      const aValue = this.getNestedValue(a, this.sortBy);
      const bValue = this.getNestedValue(b, this.sortBy);
      
      let comparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime();
      } else {
        comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }
      
      return this.sortOrder === 'desc' ? -comparison : comparison;
    });
  }

  // 중첩 객체 값 가져오기
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  // 리스트 렌더링 (하위 클래스에서 오버라이드)
  renderList(container, items) {
    const html = items.map(item => this.renderItem(item)).join('');
    container.innerHTML = `<div class="card-grid">${html}</div>`;
  }

  // 개별 아이템 렌더링 (하위 클래스에서 구현)
  renderItem(item) {
    return `
      <div class="list-card" data-id="${item.id}">
        <div class="list-card-header">
          <h3 class="list-card-title">${item.title || item.name}</h3>
          <span class="badge">${item.category}</span>
        </div>
        <div class="list-card-content">
          <p>${item.description || item.bio || ''}</p>
        </div>
      </div>
    `;
  }

  // 디바운싱
  debounce(func, wait) {
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

  // 아이템 클릭 이벤트 설정
  setupItemClick(onClickHandler) {
    this.container.addEventListener('click', (e) => {
      const listCard = e.target.closest('.list-card');
      if (listCard) {
        const itemId = listCard.dataset.id;
        onClickHandler(itemId);
      }
    });
  }

  // 필터 옵션 생성
  static createFilterOptions(data, field, labelKey = null) {
    const values = [...new Set(data.map(item => {
      const value = field.split('.').reduce((obj, key) => obj?.[key], item);
      return Array.isArray(value) ? value : [value];
    }).flat())].filter(Boolean);

    return values.map(value => ({
      value,
      label: labelKey ? value[labelKey] : value
    }));
  }
}

// 체육시설 리스트 매니저
export class FacilitiesListManager extends ListManager {
  constructor(container) {
    super({
      type: 'facilities',
      container,
      itemsPerPage: 9
    });
  }

  renderItem(facility) {
    return `
      <div class="list-card facility-card" data-id="${facility.id}">
        <div class="card-image">
          <img src="${facility.images[0] || '/images/placeholder-facility.jpg'}" 
               alt="${facility.name}" loading="lazy">
        </div>
        <div class="card-content">
          <div class="card-header">
            <h3 class="card-title">${facility.name}</h3>
            <span class="badge">${facility.category}</span>
          </div>
          <div class="card-meta">
            <span class="location">📍 ${facility.location.district}</span>
            <span class="capacity">👥 최대 ${facility.capacity}명</span>
          </div>
          <div class="facilities-list">
            ${facility.facilities.slice(0, 3).map(f => `<span class="tag">${f}</span>`).join('')}
            ${facility.facilities.length > 3 ? `<span class="tag-more">+${facility.facilities.length - 3}</span>` : ''}
          </div>
          <div class="card-footer">
            <span class="rating">⭐ ${facility.rating}</span>
            <span class="price">시간당 ${facility.fees.hourly.toLocaleString()}원</span>
          </div>
        </div>
      </div>
    `;
  }
}

// 프로그램 리스트 매니저
export class ProgramsListManager extends ListManager {
  constructor(container) {
    super({
      type: 'programs',
      container,
      itemsPerPage: 8
    });
  }

  renderItem(program) {
    const spotsLeft = program.maxParticipants - program.currentParticipants;
    return `
      <div class="list-card program-card" data-id="${program.id}">
        <div class="card-content">
          <div class="card-header">
            <h3 class="card-title">${program.title}</h3>
            <span class="badge">${program.category}</span>
          </div>
          <div class="card-meta">
            <span class="level">${program.level === 'beginner' ? '초급' : program.level === 'intermediate' ? '중급' : '고급'}</span>
            <span class="duration">${program.duration}분</span>
            <span class="spots ${spotsLeft <= 2 ? 'low' : ''}">${spotsLeft}자리 남음</span>
          </div>
          <p class="card-description">${program.description}</p>
          <div class="card-schedule">
            <span class="days">${program.schedule.days.join(', ')}</span>
            <span class="time">${program.schedule.time}</span>
          </div>
          <div class="card-footer">
            <span class="rating">⭐ ${program.rating}</span>
            <span class="price">${program.price.toLocaleString()}원</span>
          </div>
        </div>
      </div>
    `;
  }
}

// 지도자 리스트 매니저
export class CoachesListManager extends ListManager {
  constructor(container) {
    super({
      type: 'coaches',
      container,
      itemsPerPage: 6
    });
  }

  renderItem(coach) {
    return `
      <div class="list-card coach-card" data-id="${coach.id}">
        <div class="card-image">
          <img src="${coach.profileImage || '/images/placeholder-coach.jpg'}" 
               alt="${coach.name}" loading="lazy">
        </div>
        <div class="card-content">
          <div class="card-header">
            <h3 class="card-title">${coach.name}</h3>
            <span class="experience">${coach.experience}년 경력</span>
          </div>
          <div class="specialties">
            ${coach.specialties.map(s => `<span class="tag">${s}</span>`).join('')}
          </div>
          <p class="card-description">${coach.bio.substring(0, 100)}...</p>
          <div class="card-footer">
            <span class="rating">⭐ ${coach.rating}</span>
            <span class="price">시간당 ${coach.hourlyRate.toLocaleString()}원</span>
          </div>
        </div>
      </div>
    `;
  }
}

export default ListManager;
