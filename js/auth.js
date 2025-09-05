// 인증 관리 시스템
class AuthManager {
  constructor() {
    this.tokenKey = 'allfit_token';
    this.userKey = 'allfit_user';
    this.init();
  }

  init() {
    this.checkAuthState();
    this.setupAutoLogout();
  }

  // 로그인
  async login(email, password) {
    try {
      // 모의 인증 (실제로는 서버 API 호출)
      const validCredentials = {
        'admin@allfit.app': 'allfit123!'
      };

      if (validCredentials[email] === password) {
        const token = this.generateMockToken();
        const user = {
          id: 'admin-1',
          email: email,
          name: '관리자',
          role: 'admin',
          loginAt: new Date().toISOString()
        };

        localStorage.setItem(this.tokenKey, token);
        localStorage.setItem(this.userKey, JSON.stringify(user));

        this.updateUIAuthState(true);
        return { success: true, user, token };
      } else {
        return { 
          success: false, 
          error: '이메일 또는 비밀번호가 올바르지 않습니다.' 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: '로그인 중 오류가 발생했습니다.' };
    }
  }

  // 로그아웃
  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.updateUIAuthState(false);
    
    // 관리자 페이지에 있다면 홈으로 리디렉션
    if (window.location.pathname.startsWith('/admin/')) {
      window.location.href = '/';
    }
  }

  // 토큰 생성 (모의)
  generateMockToken() {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      sub: 'admin-1',
      role: 'admin',
      iat: Date.now() / 1000,
      exp: (Date.now() / 1000) + (24 * 60 * 60) // 24시간
    }));
    const signature = btoa('mock-signature');
    return `${header}.${payload}.${signature}`;
  }

  // 인증 상태 확인
  isAuthenticated() {
    const token = localStorage.getItem(this.tokenKey);
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } catch (error) {
      this.logout();
      return false;
    }
  }

  // 현재 사용자 정보
  getCurrentUser() {
    if (!this.isAuthenticated()) return null;
    
    try {
      const userStr = localStorage.getItem(this.userKey);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Failed to parse user data:', error);
      return null;
    }
  }

  // 관리자 권한 확인
  isAdmin() {
    const user = this.getCurrentUser();
    return user && user.role === 'admin';
  }

  // 페이지 접근 권한 확인
  canAccessPage(path) {
    if (path.startsWith('/admin/')) {
      return this.isAdmin();
    }
    return true;
  }

  // 인증 가드 (페이지 보호)
  guard(requiredRole = null) {
    if (!this.isAuthenticated()) {
      this.redirectToLogin();
      return false;
    }

    if (requiredRole && !this.hasRole(requiredRole)) {
      window.location.href = '/';
      return false;
    }

    return true;
  }

  // 역할 확인
  hasRole(role) {
    const user = this.getCurrentUser();
    return user && user.role === role;
  }

  // 로그인 페이지로 리디렉션
  redirectToLogin() {
    const currentPath = window.location.pathname;
    const loginUrl = `/login.html${currentPath !== '/' ? `?redirect=${encodeURIComponent(currentPath)}` : ''}`;
    window.location.href = loginUrl;
  }

  // UI 인증 상태 업데이트
  updateUIAuthState(isLoggedIn) {
    const loginBtn = document.getElementById('loginBtn');
    const adminTabs = document.querySelectorAll('[data-admin-tab]');
    
    if (loginBtn) {
      if (isLoggedIn) {
        loginBtn.textContent = '로그아웃';
        loginBtn.href = '#';
        loginBtn.onclick = (e) => {
          e.preventDefault();
          this.logout();
        };
      } else {
        loginBtn.textContent = '로그인';
        loginBtn.href = '/login.html';
        loginBtn.onclick = null;
      }
    }

    adminTabs.forEach(tab => {
      tab.style.display = isLoggedIn && this.isAdmin() ? 'block' : 'none';
    });

    // 바디에 인증 상태 클래스 추가
    if (isLoggedIn && this.isAdmin()) {
      document.body.setAttribute('data-admin', 'true');
    } else {
      document.body.removeAttribute('data-admin');
    }
  }

  // 인증 상태 체크 (페이지 로드시)
  checkAuthState() {
    const isLoggedIn = this.isAuthenticated();
    this.updateUIAuthState(isLoggedIn);
    
    // 인증이 필요한 페이지에서 비인증 사용자 차단
    const currentPath = window.location.pathname;
    if (currentPath.startsWith('/admin/') && !this.isAdmin()) {
      this.redirectToLogin();
    }
  }

  // 자동 로그아웃 설정 (토큰 만료)
  setupAutoLogout() {
    const token = localStorage.getItem(this.tokenKey);
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000;
      const currentTime = Date.now();
      
      if (expirationTime > currentTime) {
        const timeUntilExpiry = expirationTime - currentTime;
        
        setTimeout(() => {
          this.logout();
          alert('세션이 만료되었습니다. 다시 로그인해주세요.');
        }, timeUntilExpiry);
      } else {
        this.logout();
      }
    } catch (error) {
      console.error('Token parsing error:', error);
      this.logout();
    }
  }

  // 로그인 폼 처리
  async handleLoginForm(form) {
    const formData = new FormData(form);
    const email = formData.get('email');
    const password = formData.get('password');

    if (!email || !password) {
      return { success: false, error: '이메일과 비밀번호를 모두 입력해주세요.' };
    }

    const result = await this.login(email, password);
    
    if (result.success) {
      // 로그인 성공시 리디렉션
      const urlParams = new URLSearchParams(window.location.search);
      const redirect = urlParams.get('redirect') || '/admin/';
      window.location.href = redirect;
    }

    return result;
  }

  // 토큰 갱신 (실제 구현에서는 refresh token 사용)
  async refreshToken() {
    // 모의 토큰 갱신
    if (this.isAuthenticated()) {
      const newToken = this.generateMockToken();
      localStorage.setItem(this.tokenKey, newToken);
      return newToken;
    }
    return null;
  }

  // API 요청시 인증 헤더 추가
  getAuthHeaders() {
    const token = localStorage.getItem(this.tokenKey);
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  // 사용자 프로필 업데이트
  updateUserProfile(updates) {
    const user = this.getCurrentUser();
    if (user) {
      const updatedUser = { ...user, ...updates };
      localStorage.setItem(this.userKey, JSON.stringify(updatedUser));
      return updatedUser;
    }
    return null;
  }

  // 비밀번호 변경 (모의)
  async changePassword(currentPassword, newPassword) {
    // 실제 구현에서는 서버 API 호출
    const user = this.getCurrentUser();
    if (user && currentPassword === 'allfit123!') {
      // 비밀번호 변경 성공 (모의)
      return { success: true };
    }
    return { success: false, error: '현재 비밀번호가 올바르지 않습니다.' };
  }
}

// 싱글톤 인스턴스 생성
export const auth = new AuthManager();

// 편의 함수들
export const isAuthenticated = () => auth.isAuthenticated();
export const getCurrentUser = () => auth.getCurrentUser();
export const isAdmin = () => auth.isAdmin();
export const logout = () => auth.logout();
export const guard = (role) => auth.guard(role);

export default auth;
