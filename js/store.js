// 데이터 스토어 - 정적 JSON + localStorage 오버레이
class DataStore {
  constructor() {
    this.cache = new Map();
    this.storageKey = 'allfit_db';
    this.init();
  }

  async init() {
    // localStorage에서 오버레이 데이터 로드
    try {
      const stored = localStorage.getItem(this.storageKey);
      this.overlay = stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.warn('Failed to load localStorage data:', error);
      this.overlay = {};
    }
  }

  // JSON 파일 로드 및 캐싱
  async loadData(type) {
    if (this.cache.has(type)) {
      return this.cache.get(type);
    }

    try {
      const response = await fetch(`/data/${type}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load ${type}: ${response.status}`);
      }
      
      const data = await response.json();
      this.cache.set(type, data);
      return data;
    } catch (error) {
      console.error(`Error loading ${type}:`, error);
      return [];
    }
  }

  // 오버레이 데이터와 병합
  async getData(type) {
    const baseData = await this.loadData(type);
    const overlayData = this.overlay[type] || {};
    
    // 기본 데이터에 오버레이 적용 (CRUD 반영)
    const result = [...baseData];
    
    // 삭제된 항목 제거
    if (overlayData.deleted) {
      overlayData.deleted.forEach(id => {
        const index = result.findIndex(item => item.id === id);
        if (index !== -1) result.splice(index, 1);
      });
    }
    
    // 수정된 항목 업데이트
    if (overlayData.updated) {
      Object.entries(overlayData.updated).forEach(([id, updates]) => {
        const index = result.findIndex(item => item.id === id);
        if (index !== -1) {
          result[index] = { ...result[index], ...updates };
        }
      });
    }
    
    // 새로운 항목 추가
    if (overlayData.created) {
      result.push(...overlayData.created);
    }
    
    return result;
  }

  // 오버레이에 변경사항 저장
  saveOverlay() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.overlay));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  // CRUD 메소드들
  async create(type, item) {
    if (!this.overlay[type]) this.overlay[type] = {};
    if (!this.overlay[type].created) this.overlay[type].created = [];
    
    const newItem = {
      ...item,
      id: item.id || `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.overlay[type].created.push(newItem);
    this.saveOverlay();
    return newItem;
  }

  async update(type, id, updates) {
    if (!this.overlay[type]) this.overlay[type] = {};
    if (!this.overlay[type].updated) this.overlay[type].updated = {};
    
    this.overlay[type].updated[id] = {
      ...this.overlay[type].updated[id],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    this.saveOverlay();
    return this.overlay[type].updated[id];
  }

  async delete(type, id) {
    if (!this.overlay[type]) this.overlay[type] = {};
    if (!this.overlay[type].deleted) this.overlay[type].deleted = [];
    
    if (!this.overlay[type].deleted.includes(id)) {
      this.overlay[type].deleted.push(id);
      this.saveOverlay();
    }
    
    return true;
  }

  async findById(type, id) {
    const data = await this.getData(type);
    return data.find(item => item.id === id);
  }

  // 검색 및 필터링
  async search(type, query, options = {}) {
    const data = await this.getData(type);
    const { fields = [], caseSensitive = false } = options;
    
    if (!query) return data;
    
    const searchTerm = caseSensitive ? query : query.toLowerCase();
    
    return data.filter(item => {
      const searchFields = fields.length > 0 ? fields : Object.keys(item);
      
      return searchFields.some(field => {
        const value = this.getNestedValue(item, field);
        if (value == null) return false;
        
        const stringValue = caseSensitive ? String(value) : String(value).toLowerCase();
        return stringValue.includes(searchTerm);
      });
    });
  }

  // 필터링
  async filter(type, filters = {}) {
    const data = await this.getData(type);
    
    return data.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        if (value === undefined || value === null || value === '') return true;
        
        const itemValue = this.getNestedValue(item, key);
        
        if (Array.isArray(value)) {
          return value.includes(itemValue);
        }
        
        if (typeof value === 'object' && value.min !== undefined) {
          const numValue = Number(itemValue);
          if (value.min && numValue < value.min) return false;
          if (value.max && numValue > value.max) return false;
          return true;
        }
        
        return itemValue === value;
      });
    });
  }

  // 정렬
  async sort(type, sortBy, order = 'asc') {
    const data = await this.getData(type);
    
    return data.sort((a, b) => {
      const aValue = this.getNestedValue(a, sortBy);
      const bValue = this.getNestedValue(b, sortBy);
      
      if (aValue === bValue) return 0;
      
      let comparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else {
        comparison = aValue < bValue ? -1 : 1;
      }
      
      return order === 'desc' ? -comparison : comparison;
    });
  }

  // 페이징
  paginate(data, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const paginatedData = data.slice(offset, offset + limit);
    
    return {
      data: paginatedData,
      pagination: {
        page,
        limit,
        total: data.length,
        pages: Math.ceil(data.length / limit),
        hasNext: page < Math.ceil(data.length / limit),
        hasPrev: page > 1
      }
    };
  }

  // 중첩 객체 값 가져오기
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  // 통계 정보
  async getStats(type) {
    const data = await this.getData(type);
    return {
      total: data.length,
      active: data.filter(item => item.status === 'active').length,
      inactive: data.filter(item => item.status === 'inactive').length
    };
  }

  // 데모 데이터 리셋
  resetDemoData() {
    localStorage.removeItem(this.storageKey);
    this.overlay = {};
    this.cache.clear();
    console.log('Demo data reset completed');
  }

  // 전역 검색 (모든 타입에서 검색)
  async globalSearch(query, types = ['facilities', 'programs', 'coaches', 'notices']) {
    const results = {};
    
    for (const type of types) {
      try {
        const searchResult = await this.search(type, query, {
          fields: this.getSearchFields(type)
        });
        results[type] = searchResult.slice(0, 5); // 타입당 최대 5개
      } catch (error) {
        console.error(`Global search error for ${type}:`, error);
        results[type] = [];
      }
    }
    
    return results;
  }

  // 타입별 검색 필드 정의
  getSearchFields(type) {
    const fieldMap = {
      facilities: ['name', 'description', 'location.address', 'facilities', 'category'],
      programs: ['title', 'description', 'category', 'benefits'],
      coaches: ['name', 'specialties', 'bio', 'qualifications'],
      notices: ['title', 'content', 'category'],
      news: ['title', 'summary', 'content', 'tags'],
      faqs: ['question', 'answer', 'category']
    };
    
    return fieldMap[type] || [];
  }
}

// 싱글톤 인스턴스 생성
export const store = new DataStore();

// 편의 함수들
export const getFacilities = (filters) => store.filter('facilities', filters);
export const getPrograms = (filters) => store.filter('programs', filters);
export const getCoaches = (filters) => store.filter('coaches', filters);
export const getNotices = (filters) => store.filter('notices', filters);
export const getNews = (filters) => store.filter('news', filters);
export const getFaqs = (filters) => store.filter('faqs', filters);

export const searchAll = (query) => store.globalSearch(query);
export const getStats = () => Promise.all([
  store.getStats('facilities'),
  store.getStats('programs'), 
  store.getStats('coaches'),
  store.getStats('notices')
]).then(([facilities, programs, coaches, notices]) => ({
  facilities, programs, coaches, notices
}));

export default store;
