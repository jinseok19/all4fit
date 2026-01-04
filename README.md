# 모두의핏 (Fit4All) | NEXUSCORE

모든 사람을 위한 체육시설과 프로그램을 제공하는 종합 스포츠 서비스 플랫폼입니다.

## 🏃‍♀️ 프로젝트 개요

모두의핏은 NEXUSCORE가 개발한 체육시설 예약 및 프로그램 신청 서비스로, 누구나 쉽게 접근할 수 있는 건강한 라이프스타일을 지원합니다.

### 주요 기능

- **체육시설 예약**: 다양한 체육시설을 온라인으로 간편하게 예약
- **프로그램 신청**: 개인 수준에 맞는 운동 프로그램 참여
- **전문 지도자 매칭**: 경험 많은 전문 지도자와의 연결
- **바우처 지원**: 정부 및 지자체 체육 바우처 사용 가능
- **관리자 대시보드**: 시설 및 프로그램 통합 관리

## 🛠️ 기술 스택

- **Frontend**: Vanilla JavaScript (ES Modules), HTML5, CSS3
- **Architecture**: Component-based SPA architecture
- **Data**: Static JSON + localStorage overlay
- **Styling**: CSS Variables, Responsive Design, Dark Theme
- **Performance**: Lazy Loading, Code Splitting, Caching
- **SEO**: Semantic HTML, JSON-LD, Meta Tags

## 📁 프로젝트 구조

```
/
├─ index.html                 # 홈페이지
├─ login.html                # 로그인 페이지
├─ manifest.json             # PWA 매니페스트
├─ robots.txt               # SEO 로봇 설정
├─ sitemap.xml              # 사이트맵
├─ package.json             # 프로젝트 설정
├─ /facilities/            # 체육시설
│  ├─ index.html          # 시설 목록
│  └─ detail.html         # 시설 상세
├─ /programs/             # 프로그램 (구조 동일)
├─ /coaches/              # 지도자 (구조 동일)
├─ /voucher/             # 바우처 안내
├─ /support/             # 고객센터
├─ /about/               # 회사소개
├─ /policy/              # 정책 페이지
├─ /admin/               # 관리자 대시보드
├─ /components/          # 공통 컴포넌트
│  ├─ layout.js         # 레이아웃 컴포넌트
│  └─ site-config.js    # 사이트 설정
├─ /data/               # 정적 데이터
├─ /css/                # 스타일시트
├─ /js/                 # JavaScript 모듈
├─ /images/             # 이미지 리소스
├─ /scripts/            # 배포 및 관리 스크립트
│  ├─ deploy.sh         # 메인 배포 스크립트
│  ├─ setup-ssl.sh      # SSL 인증서 설정
│  ├─ setup-pm2.sh      # PM2 설정
│  ├─ backup.sh         # 백업 스크립트
│  └─ monitor.sh        # 모니터링 스크립트
├─ /config/             # 설정 파일
│  ├─ nginx.conf        # Nginx 설정 (HTTPS)
│  ├─ nginx-http.conf   # Nginx 설정 (HTTP)
│  ├─ ecosystem.config.js # PM2 설정
│  └─ env.example       # 환경 변수 예시
├─ /docs/               # 문서
│  ├─ DEPLOYMENT.md     # 배포 가이드
│  ├─ SYSTEM_REQUIREMENTS.md # 시스템 요구사항
│  └─ S/                # 과업지시서 등
└─ /system/             # 시스템 서비스 파일
   └─ all4fit.service   # systemd 서비스 파일
```

## 🚀 설치 및 실행

### 요구사항
- 웹 서버 (Apache, Nginx 등)
- 모던 브라우저 (ES6+ 지원)

### 로컬 개발 환경

1. 저장소 클론
```bash
git clone https://github.com/nexuscore/all4fit.git
cd all4fit
```

2. 로컬 서버 실행
```bash
# Python을 사용하는 경우
python -m http.server 8000

# Node.js를 사용하는 경우
npx http-server -p 8000

# PHP를 사용하는 경우
php -S localhost:8000
```

3. 브라우저에서 접속
```
http://localhost:8000
```

### 프로덕션 배포

1. 파일을 웹 서버의 document root에 업로드
2. `.htaccess` 설정이 적용되는지 확인
3. HTTPS 설정 확인
4. 도메인에 따라 `sitemap.xml` 및 설정 파일 수정

## 🔑 관리자 접근

### 데모 계정
- **이메일**: admin@allfit.app
- **비밀번호**: allfit123!

### 관리자 기능
- 시설/프로그램/지도자 관리
- 예약 현황 모니터링  
- 통계 대시보드
- 공지사항 관리

## 🎨 디자인 시스템

### 컬러 팔레트
```css
/* 다크 테마 (기본) */
--brand: #4C6EF5;        /* 브랜드 컬러 */
--accent: #22D3EE;       /* 액센트 컬러 */
--bg: #0A0F1E;          /* 배경 */
--card: #12182B;        /* 카드 배경 */
--ink: #ffffff;         /* 주 텍스트 */
--muted: #94a3b8;       /* 보조 텍스트 */
```

### 반응형 브레이크포인트
- 모바일: ~768px
- 태블릿: 768px~1024px  
- 데스크톱: 1024px+

## 📊 성능 최적화

### Core Web Vitals 목표
- **LCP**: < 2.5s
- **FID**: < 100ms  
- **CLS**: < 0.1
- **Lighthouse Score**: 90+

### 최적화 기법
- Critical CSS 인라인화
- JavaScript 지연 로딩
- 이미지 lazy loading
- 컴포넌트 기반 코드 분할
- CDN 및 캐싱 활용

## ♿ 접근성 (a11y)

- WCAG 2.1 AA 준수
- 키보드 네비게이션 지원
- 스크린 리더 호환
- 고대비 컬러 사용
- Focus management
- Semantic HTML 구조

## 🔒 보안

- XSS 방지
- CSRF 보호
- Content Security Policy
- HTTPS 강제
- 입력값 검증 및 sanitization

## 🌍 SEO 최적화

- Semantic HTML5 구조
- Meta tags 및 Open Graph
- JSON-LD 구조화 데이터
- Sitemap 및 robots.txt
- 페이지 로딩 속도 최적화

## 📱 PWA 지원

- Web App Manifest
- Service Worker (추후 구현 예정)
- 앱과 유사한 사용자 경험
- 오프라인 지원 (부분)

## 🧪 품질 관리

### 코드 품질
- ESLint 규칙 준수
- Modern JavaScript (ES6+)
- 컴포넌트 단위 개발
- 타입 안전성 (JSDoc 사용)

### 테스트 전략
- 크로스 브라우저 테스트
- 모바일 반응형 테스트
- 접근성 테스트 (axe-core)
- 성능 테스트 (Lighthouse)

## 🚀 향후 계획

### Phase 2
- [ ] Service Worker 구현
- [ ] 실시간 알림 시스템
- [ ] 소셜 로그인 연동
- [ ] 리뷰 및 평점 시스템

### Phase 3  
- [ ] 모바일 앱 (React Native)
- [ ] AI 개인 맞춤 추천
- [ ] 블록체인 기반 포인트 시스템
- [ ] VR/AR 체험 기능

## 🤝 기여하기

프로젝트에 기여해 주셔서 감사합니다!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 📞 연락처

- **회사**: NEXUSCORE
- **이메일**: contact@nexuscore.co.kr
- **전화**: 02-1234-5678
- **주소**: 서울특별시 강남구 테헤란로 123

## 🙏 감사의 말

이 프로젝트는 다음의 오픈소스 프로젝트들에 영감을 받았습니다:
- Modern CSS techniques
- Progressive Web App standards
- Web accessibility guidelines
- Component-based architecture patterns

---

**Made with ❤️ by NEXUSCORE Team**