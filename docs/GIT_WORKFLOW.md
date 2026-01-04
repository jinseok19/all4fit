# 🔄 로컬-서버 Git 워크플로우 가이드

서버 개발자 입장에서 로컬과 서버를 효율적으로 관리하는 방법입니다.

## 📋 기본 구조

```
로컬 (Windows)          GitHub          서버 (AWS EC2)
   ↓                      ↑                ↓
개발/테스트            저장소            프로덕션 배포
   ↓                      ↑                ↓
커밋 → 푸시 ──────────→ Pull ←─────────── Pull & Deploy
```

---

## 🚀 추천 워크플로우 (3가지 방법)

### 방법 1: 표준 워크플로우 (권장) ⭐

**로컬에서 개발 → GitHub → 서버에서 배포**

#### 1단계: 로컬에서 개발
```bash
# 로컬 Cursor에서
git checkout -b feature/new-feature  # 새 기능 브랜치
# 코드 수정...
git add .
git commit -m "Add new feature"
git push origin feature/new-feature
```

#### 2단계: GitHub에서 머지
- GitHub에서 Pull Request 생성
- 리뷰 후 `main` 브랜치로 머지

#### 3단계: 서버에서 배포
```bash
# 서버 Cursor 터미널에서
cd ~/all4fit
git pull origin main
sudo ./scripts/deploy.sh
```

**장점:**
- ✅ 안전한 배포 (PR 리뷰)
- ✅ 히스토리 관리 명확
- ✅ 롤백 쉬움

---

### 방법 2: 빠른 배포 워크플로우

**로컬 → GitHub → 서버 자동 배포**

#### 1단계: 로컬에서 개발 및 푸시
```bash
# 로컬에서
git add .
git commit -m "Quick fix"
git push origin main
```

#### 2단계: 서버에서 자동 배포 스크립트
```bash
# 서버에서 (한 번만 설정)
cd ~/all4fit
cat > ~/auto-deploy.sh << 'EOF'
#!/bin/bash
cd ~/all4fit
git pull origin main
sudo ./scripts/deploy.sh
EOF
chmod +x ~/auto-deploy.sh
```

#### 3단계: 배포 실행
```bash
# 서버에서
~/auto-deploy.sh
```

**또는 서버에서 Git Hook 설정 (자동 배포)**
```bash
# 서버에서
cd ~/all4fit/.git/hooks
cat > post-receive << 'EOF'
#!/bin/bash
cd ~/all4fit
git pull origin main
sudo ./scripts/deploy.sh
EOF
chmod +x post-receive
```

**장점:**
- ✅ 빠른 배포
- ✅ 한 줄 명령어로 배포

---

### 방법 3: 브랜치 전략 워크플로우 (프로덕션)

**개발/스테이징/프로덕션 분리**

#### 브랜치 구조
```
main (프로덕션) ← 서버
  ↑
develop (개발) ← 로컬 주 개발
  ↑
feature/* (기능)
```

#### 설정

**로컬:**
```bash
git checkout -b develop
# 개발 작업...
git push origin develop
```

**서버:**
```bash
# 프로덕션은 main만 사용
cd ~/all4fit
git checkout main
git pull origin main
sudo ./scripts/deploy.sh
```

**장점:**
- ✅ 환경 분리
- ✅ 안정적인 프로덕션
- ✅ 병렬 개발 가능

---

## 🛠️ 실전 시나리오

### 시나리오 1: 긴급 버그 수정

```bash
# 로컬에서
git checkout -b hotfix/critical-bug
# 수정...
git add .
git commit -m "Fix critical bug"
git push origin hotfix/critical-bug

# GitHub에서 main으로 머지

# 서버에서
cd ~/all4fit
git pull origin main
sudo ./scripts/deploy.sh
```

### 시나리오 2: 정기 배포

```bash
# 로컬에서 (주간 배포)
git checkout main
git pull origin main
git merge develop
git push origin main

# 서버에서
cd ~/all4fit
git pull origin main
sudo ./scripts/deploy.sh
```

### 시나리오 3: 서버에서 긴급 수정

```bash
# 서버에서 직접 수정 (비상시만)
cd ~/all4fit
nano index.html  # 또는 Cursor에서 편집
sudo systemctl reload nginx

# 나중에 로컬로 동기화
# 로컬에서
git pull origin main
```

---

## 📝 일일 작업 체크리스트

### 아침 (로컬)
```bash
# 1. 최신 코드 가져오기
git pull origin main

# 2. 현재 작업 확인
git status
git branch
```

### 개발 중 (로컬)
```bash
# 1. 작은 단위로 커밋
git add .
git commit -m "작업 내용"
git push origin feature/branch-name
```

### 배포 전 (로컬)
```bash
# 1. 테스트
# 2. 커밋 메시지 확인
git log --oneline -5
# 3. 푸시
git push origin main
```

### 배포 (서버)
```bash
# 1. 서버 상태 확인
cd ~/all4fit
git status
git log --oneline -3

# 2. 배포
git pull origin main
sudo ./scripts/deploy.sh

# 3. 확인
curl -I https://all4fit.co.kr
sudo systemctl status nginx
```

---

## 🔧 효율적인 설정

### 1. Git Alias 설정 (로컬)

```bash
# 로컬에서
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.cm "commit -m"
git config --global alias.lg "log --oneline --graph --all"
```

**사용:**
```bash
git st    # git status
git cm "message"  # git commit -m "message"
git lg    # git log --oneline --graph --all
```

### 2. 서버 배포 스크립트 개선

```bash
# 서버에서 ~/all4fit/scripts/deploy.sh 수정
# Git pull + 배포를 한 번에
```

### 3. Cursor 단축키 설정

`.vscode/keybindings.json`:
```json
{
  "key": "ctrl+shift+d",
  "command": "workbench.action.terminal.sendSequence",
  "args": { "text": "cd ~/all4fit && git pull && sudo ./scripts/deploy.sh\r" }
}
```

---

## 🚨 주의사항

### ❌ 하지 말아야 할 것

1. **서버에서 직접 커밋하지 말기**
   ```bash
   # 나쁜 예
   git commit -m "Server fix"
   git push origin main
   ```
   → 로컬에서 먼저 테스트 후 배포

2. **main 브랜치에 직접 푸시하지 말기**
   ```bash
   # 나쁜 예
   git checkout main
   git push origin main
   ```
   → feature 브랜치 → PR → main

3. **서버 코드를 직접 수정하지 말기**
   ```bash
   # 나쁜 예 (비상시 제외)
   sudo nano /var/www/all4fit/index.html
   ```
   → 로컬에서 수정 → GitHub → 서버 배포

### ✅ 권장 사항

1. **작은 단위로 커밋**
   - 한 커밋 = 하나의 기능/수정

2. **의미 있는 커밋 메시지**
   ```bash
   git commit -m "Add user authentication"
   git commit -m "Fix SSL renewal issue"
   ```

3. **배포 전 테스트**
   - 로컬에서 테스트
   - 서버 배포 후 확인

---

## 🔄 동기화 문제 해결

### 서버와 로컬이 달라졌을 때

```bash
# 서버에서
cd ~/all4fit
git status
git fetch origin
git log HEAD..origin/main  # 서버에 없는 커밋 확인

# 로컬에서
git pull origin main
```

### 충돌 해결

```bash
# 서버에서
cd ~/all4fit
git pull origin main
# 충돌 발생 시
git status  # 충돌 파일 확인
# 파일 수정 후
git add .
git commit -m "Resolve merge conflict"
```

---

## 📊 모니터링

### 배포 후 확인

```bash
# 서버에서
# 1. 서비스 상태
sudo systemctl status nginx
pm2 status

# 2. 로그 확인
sudo tail -f /var/log/nginx/all4fit_error.log

# 3. 사이트 접속 확인
curl -I https://all4fit.co.kr
```

### Git 히스토리 확인

```bash
# 서버에서
cd ~/all4fit
git log --oneline -10
git log --graph --all --oneline
```

---

## 💡 프로 팁

### 1. 배포 전 체크리스트 스크립트

```bash
# 서버에서 ~/pre-deploy-check.sh
#!/bin/bash
cd ~/all4fit
echo "=== Pre-Deploy Check ==="
echo "1. Git status:"
git status
echo ""
echo "2. Recent commits:"
git log --oneline -5
echo ""
echo "3. Nginx config:"
sudo nginx -t
echo ""
echo "4. Disk space:"
df -h | grep -E "Filesystem|/dev/"
```

### 2. 자동 배포 스크립트 (서버)

```bash
# ~/auto-deploy.sh
#!/bin/bash
set -e
cd ~/all4fit

echo "🔄 Starting deployment..."
git pull origin main

echo "✅ Code updated"
sudo ./scripts/deploy.sh

echo "✅ Deployment complete"
echo "🌐 Site: https://all4fit.co.kr"
```

### 3. 배포 알림 (선택사항)

```bash
# 배포 완료 후 알림 (이메일, 슬랙 등)
# ~/deploy-with-notify.sh
```

---

## 🎯 요약: 가장 효율적인 워크플로우

### 일상 작업
1. **로컬에서 개발** → 커밋 → 푸시
2. **GitHub에서 PR** → 리뷰 → 머지
3. **서버에서 배포**: `git pull && sudo ./scripts/deploy.sh`

### 긴급 수정
1. **로컬에서 수정** → 커밋 → 푸시
2. **서버에서 즉시 배포**: `git pull && sudo ./scripts/deploy.sh`

### 장기 프로젝트
1. **브랜치 전략 사용** (develop/main)
2. **정기 배포** (주간/월간)
3. **자동화 스크립트 활용**

---

이 워크플로우를 따르면 로컬과 서버를 효율적으로 관리할 수 있습니다! 🚀

