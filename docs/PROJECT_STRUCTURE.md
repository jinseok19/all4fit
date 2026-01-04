# 📁 프로젝트 구조

## 🎯 핵심 구조

```
all4fit/
├── 📄 루트 파일들 (배포 필요)
│   ├── index.html          # 메인 페이지
│   ├── login.html          # 로그인 페이지
│   ├── manifest.json       # PWA 매니페스트
│   ├── robots.txt          # SEO 설정
│   ├── sitemap.xml         # 사이트맵
│   ├── package.json        # 프로젝트 설정
│   └── README.md           # 프로젝트 설명
│
├── 📂 scripts/             # 배포 스크립트
│   ├── deploy.sh           # 메인 배포
│   ├── deploy-with-git.sh  # Git 포함 배포
│   ├── setup-ssl.sh        # SSL 설정
│   └── ...
│
├── 📂 config/              # 서버 설정
│   ├── nginx*.conf         # Nginx 설정
│   ├── ecosystem.config.js # PM2 설정
│   └── env.example         # 환경 변수 예시
│
├── 📂 docs/                # 문서
│   ├── DEPLOYMENT.md       # 배포 가이드
│   ├── GIT_WORKFLOW.md     # Git 워크플로우
│   └── ...
│
├── 📂 system/              # 시스템 서비스
│   └── all4fit.service     # systemd 서비스
│
├── 📂 trash/               # 로컬 개발용 (Git 무시)
│   ├── setup-ssh*.ps1      # SSH 설정 스크립트
│   └── README.md           # 설명
│
└── 📂 웹사이트 파일들
    ├── css/                # 스타일시트
    ├── js/                 # JavaScript
    ├── components/        # 컴포넌트
    ├── data/               # JSON 데이터
    └── ...
```

## 🗂️ 폴더별 설명

### ✅ 배포 포함 폴더
- **루트 파일들**: 웹사이트 핵심 파일
- **scripts/**: 서버 배포 스크립트
- **config/**: 서버 설정 파일
- **docs/**: 프로젝트 문서
- **system/**: 시스템 서비스 파일
- **웹사이트 폴더들**: css, js, components, data 등

### ❌ Git 무시 폴더
- **trash/**: 로컬 개발용 파일 (SSH 설정 등)
- **.vscode/**: 에디터 설정 (개인 설정)
- **node_modules/**: 의존성 (향후 사용 시)

## 📝 .gitignore 정책

### 무시되는 파일들
1. **로컬 개발 도구**: SSH 키, 로컬 서버 스크립트
2. **임시 파일**: trash/, *.old, *.bak
3. **에디터 설정**: .vscode/settings.json (개인 설정)
4. **환경 변수**: .env 파일들
5. **로그 파일**: *.log

### 포함되는 파일들
1. **배포 스크립트**: scripts/ 폴더 전체
2. **서버 설정**: config/ 폴더 전체
3. **문서**: docs/ 폴더 전체
4. **웹사이트 파일**: 모든 HTML, CSS, JS 파일

## 🔄 파일 관리 원칙

### ✅ Git에 포함
- 서버 배포에 필요한 모든 파일
- 공유해야 하는 설정 파일
- 프로젝트 문서

### ❌ Git에 제외
- 개인 개발 환경 설정
- 로컬 전용 스크립트
- 임시/백업 파일
- 민감한 정보 (키 파일, .env)

## 🗑️ trash 폴더 사용법

### 언제 사용?
- 로컬에서만 필요한 파일
- 배포와 무관한 도구
- 구버전 파일 (나중에 참고용)

### 복구 방법
```bash
# 필요시 trash에서 복구
mv trash/setup-ssh-simple.ps1 .
```

### 정리 주기
- 주기적으로 trash 폴더 확인
- 완전히 불필요한 파일은 삭제
- 중요한 파일은 docs/로 이동

