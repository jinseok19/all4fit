// 상세 페이지 공통 기능
import { store } from './store.js';
import UIComponents from './ui.js';

export class DetailManager {
  constructor(options = {}) {
    this.type = options.type;
    this.container = options.container;
    this.id = this.getIdFromUrl();
    
    this.init();
  }

  async init() {
    if (!this.id) {
      this.showError('잘못된 접근입니다.');
      return;
    }

    await this.loadAndRender();
  }

  // URL에서 ID 추출
  getIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
  }

  // 데이터 로드 및 렌더링
  async loadAndRender() {
    try {
      UIComponents.showLoading(this.container);

      const item = await store.findById(this.type, this.id);
      
      if (!item) {
        this.showError('요청한 정보를 찾을 수 없습니다.');
        return;
      }

      this.renderDetail(item);
      
      // 관련 데이터 로드
      await this.loadRelatedData(item);

    } catch (error) {
      console.error('Detail load error:', error);
      this.showError('정보를 불러오는 중 오류가 발생했습니다.');
    }
  }

  // 에러 표시
  showError(message) {
    UIComponents.showError(this.container, message, () => {
      window.history.back();
    });
  }

  // 상세 정보 렌더링 (하위 클래스에서 구현)
  renderDetail(item) {
    this.container.innerHTML = `
      <div class="detail-content">
        <h1>${item.title || item.name}</h1>
        <p>${item.description || item.bio || ''}</p>
      </div>
    `;
  }

  // 관련 데이터 로드 (하위 클래스에서 구현)
  async loadRelatedData(item) {
    // Override in subclasses
  }

  // 이미지 갤러리 렌더링
  renderImageGallery(images, title) {
    if (!images || images.length === 0) return '';

    return `
      <div class="image-gallery">
        <div class="main-image">
          <img src="${images[0]}" alt="${title}" loading="lazy">
        </div>
        ${images.length > 1 ? `
          <div class="thumbnail-list">
            ${images.map((img, index) => `
              <img src="${img}" alt="${title} ${index + 1}" 
                   class="thumbnail ${index === 0 ? 'active' : ''}" 
                   data-index="${index}" loading="lazy">
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }

  // 이미지 갤러리 이벤트 설정
  setupImageGallery() {
    const gallery = this.container.querySelector('.image-gallery');
    if (!gallery) return;

    const mainImage = gallery.querySelector('.main-image img');
    const thumbnails = gallery.querySelectorAll('.thumbnail');

    thumbnails.forEach(thumb => {
      thumb.addEventListener('click', () => {
        const index = parseInt(thumb.dataset.index);
        mainImage.src = thumb.src;
        
        thumbnails.forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
      });
    });
  }

  // 예약/신청 폼 렌더링
  renderBookingForm(item) {
    return `
      <div class="booking-form-container">
        <div class="booking-form card">
          <h3>예약/신청하기</h3>
          <form id="bookingForm">
            <input type="hidden" name="itemId" value="${item.id}">
            <input type="hidden" name="itemType" value="${this.type}">
            
            <div class="form-group">
              <label for="bookingDate">예약 날짜</label>
              <input type="date" id="bookingDate" name="date" required min="${this.getTodayString()}">
            </div>
            
            <div class="form-group">
              <label for="bookingTime">시간</label>
              <select id="bookingTime" name="time" required>
                <option value="">시간을 선택해주세요</option>
                ${this.getAvailableTimeSlots().map(slot => 
                  `<option value="${slot.value}">${slot.label}</option>`
                ).join('')}
              </select>
            </div>
            
            <div class="form-group">
              <label for="participantCount">참가 인원</label>
              <select id="participantCount" name="participants" required>
                ${Array.from({length: Math.min(item.maxParticipants || 10, 10)}, (_, i) => 
                  `<option value="${i + 1}">${i + 1}명</option>`
                ).join('')}
              </select>
            </div>
            
            <div class="form-group">
              <label for="bookerName">예약자 이름</label>
              <input type="text" id="bookerName" name="name" required>
            </div>
            
            <div class="form-group">
              <label for="bookerPhone">연락처</label>
              <input type="tel" id="bookerPhone" name="phone" required>
            </div>
            
            <div class="form-group">
              <label for="bookerEmail">이메일</label>
              <input type="email" id="bookerEmail" name="email" required>
            </div>
            
            <div class="form-group">
              <label for="notes">특이사항</label>
              <textarea id="notes" name="notes" rows="3" 
                       placeholder="요청사항이나 특이사항을 입력해주세요"></textarea>
            </div>
            
            <div class="price-info">
              <div class="price-row">
                <span>기본 요금:</span>
                <span id="basePrice">${this.getBasePrice(item).toLocaleString()}원</span>
              </div>
              <div class="price-row total">
                <span>총 요금:</span>
                <span id="totalPrice">${this.getBasePrice(item).toLocaleString()}원</span>
              </div>
            </div>
            
            <button type="submit" class="btn btn-primary btn-lg">예약하기</button>
          </form>
        </div>
      </div>
    `;
  }

  // 기본 가격 계산
  getBasePrice(item) {
    if (this.type === 'facilities') {
      return item.fees.hourly;
    } else if (this.type === 'programs') {
      return item.price;
    } else if (this.type === 'coaches') {
      return item.hourlyRate;
    }
    return 0;
  }

  // 오늘 날짜 문자열
  getTodayString() {
    return new Date().toISOString().split('T')[0];
  }

  // 사용 가능한 시간 슬롯
  getAvailableTimeSlots() {
    const slots = [];
    for (let hour = 9; hour <= 21; hour++) {
      slots.push({
        value: `${hour}:00`,
        label: `${hour}:00 - ${hour + 1}:00`
      });
    }
    return slots;
  }

  // 예약 폼 처리
  setupBookingForm(item) {
    const form = document.getElementById('bookingForm');
    if (!form) return;

    // 가격 계산 업데이트
    const participantSelect = form.querySelector('#participantCount');
    const totalPriceElement = form.querySelector('#totalPrice');
    
    const updatePrice = () => {
      const participants = parseInt(participantSelect.value) || 1;
      const basePrice = this.getBasePrice(item);
      const total = basePrice * (this.type === 'programs' ? 1 : participants);
      totalPriceElement.textContent = total.toLocaleString() + '원';
    };

    participantSelect.addEventListener('change', updatePrice);

    // 폼 제출 처리
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleBooking(form, item);
    });
  }

  // 예약 처리
  async handleBooking(form, item) {
    const formData = new FormData(form);
    const bookingData = Object.fromEntries(formData.entries());
    
    try {
      // 폼 검증
      const validation = this.validateBookingForm(bookingData, item);
      if (!validation.valid) {
        UIComponents.showToast(validation.message, 'error');
        return;
      }

      // 예약 데이터 저장 (localStorage)
      const booking = {
        id: `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...bookingData,
        totalPrice: this.calculateTotalPrice(bookingData, item),
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      this.saveBooking(booking);
      
      UIComponents.showToast('예약이 완료되었습니다!', 'success');
      
      // 예약 확인 모달
      this.showBookingConfirmation(booking);

    } catch (error) {
      console.error('Booking error:', error);
      UIComponents.showToast('예약 처리 중 오류가 발생했습니다.', 'error');
    }
  }

  // 예약 폼 검증
  validateBookingForm(data, item) {
    if (!data.name || !data.phone || !data.email) {
      return { valid: false, message: '모든 필수 정보를 입력해주세요.' };
    }

    if (!data.date || !data.time) {
      return { valid: false, message: '날짜와 시간을 선택해주세요.' };
    }

    const selectedDate = new Date(data.date);
    const today = new Date();
    if (selectedDate < today) {
      return { valid: false, message: '오늘 이후 날짜를 선택해주세요.' };
    }

    return { valid: true };
  }

  // 총 가격 계산
  calculateTotalPrice(data, item) {
    const participants = parseInt(data.participants) || 1;
    const basePrice = this.getBasePrice(item);
    return basePrice * (this.type === 'programs' ? 1 : participants);
  }

  // 예약 저장
  saveBooking(booking) {
    const bookings = JSON.parse(localStorage.getItem('allfit_bookings') || '[]');
    bookings.push(booking);
    localStorage.setItem('allfit_bookings', JSON.stringify(bookings));
  }

  // 예약 확인 모달
  showBookingConfirmation(booking) {
    const content = `
      <div class="booking-confirmation">
        <h4>예약이 완료되었습니다!</h4>
        <div class="booking-details">
          <p><strong>예약 번호:</strong> ${booking.id}</p>
          <p><strong>날짜:</strong> ${booking.date}</p>
          <p><strong>시간:</strong> ${booking.time}</p>
          <p><strong>인원:</strong> ${booking.participants}명</p>
          <p><strong>총 요금:</strong> ${booking.totalPrice.toLocaleString()}원</p>
        </div>
        <p class="confirmation-note">
          예약 확정을 위해 담당자가 연락드릴 예정입니다.<br>
          문의사항이 있으시면 고객센터로 연락해주세요.
        </p>
      </div>
    `;
    
    UIComponents.showModal(content, {
      title: '예약 완료',
      size: 'medium'
    });
  }

  // 리뷰 섹션 렌더링
  renderReviewsSection(item) {
    return `
      <div class="reviews-section">
        <div class="reviews-header">
          <h3>리뷰 (${item.reviewCount || 0})</h3>
          <div class="rating-summary">
            <span class="rating-score">${item.rating || 0}</span>
            <div class="rating-stars">${'★'.repeat(Math.round(item.rating || 0))}</div>
          </div>
        </div>
        <div class="reviews-list" id="reviewsList">
          <!-- 리뷰 목록이 여기에 로드됩니다 -->
        </div>
      </div>
    `;
  }
}

// 체육시설 상세 매니저
export class FacilityDetailManager extends DetailManager {
  constructor(container) {
    super({ type: 'facilities', container });
  }

  renderDetail(facility) {
    this.container.innerHTML = `
      <div class="facility-detail">
        <div class="detail-header">
          <div class="breadcrumb">
            <a href="/facilities/">체육시설</a> > <span>${facility.name}</span>
          </div>
          <h1>${facility.name}</h1>
          <div class="facility-meta">
            <span class="category">${facility.category}</span>
            <span class="rating">⭐ ${facility.rating} (${facility.reviewCount})</span>
            <span class="status ${facility.status}">${facility.status === 'active' ? '운영중' : '휴업'}</span>
          </div>
        </div>

        <div class="detail-content">
          <div class="main-content">
            ${this.renderImageGallery(facility.images, facility.name)}
            
            <div class="facility-info card">
              <h3>시설 정보</h3>
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">주소</span>
                  <span class="value">${facility.location.address}</span>
                </div>
                <div class="info-item">
                  <span class="label">수용인원</span>
                  <span class="value">최대 ${facility.capacity}명</span>
                </div>
                <div class="info-item">
                  <span class="label">운영시간</span>
                  <span class="value">
                    평일: ${facility.operatingHours.weekday}<br>
                    주말: ${facility.operatingHours.weekend}
                  </span>
                </div>
                <div class="info-item">
                  <span class="label">연락처</span>
                  <span class="value">${facility.contact.phone}</span>
                </div>
              </div>
            </div>

            <div class="facilities-list card">
              <h3>이용 가능한 시설</h3>
              <div class="facilities-tags">
                ${facility.facilities.map(f => `<span class="tag">${f}</span>`).join('')}
              </div>
            </div>

            <div class="amenities card">
              <h3>편의시설</h3>
              <div class="amenities-tags">
                ${facility.amenities.map(a => `<span class="tag">${a}</span>`).join('')}
              </div>
            </div>

            <div class="description card">
              <h3>시설 소개</h3>
              <p>${facility.description}</p>
            </div>

            ${this.renderReviewsSection(facility)}
          </div>

          <div class="sidebar">
            <div class="pricing-info card">
              <h3>이용 요금</h3>
              <div class="price-list">
                <div class="price-item">
                  <span>시간당</span>
                  <span class="price">${facility.fees.hourly.toLocaleString()}원</span>
                </div>
                <div class="price-item">
                  <span>1일</span>
                  <span class="price">${facility.fees.daily.toLocaleString()}원</span>
                </div>
                <div class="price-item">
                  <span>월 정기</span>
                  <span class="price">${facility.fees.monthly.toLocaleString()}원</span>
                </div>
              </div>
            </div>

            ${this.renderBookingForm(facility)}
          </div>
        </div>
      </div>
    `;

    // 이벤트 설정
    this.setupImageGallery();
    this.setupBookingForm(facility);
  }
}

export default DetailManager;
