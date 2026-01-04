# 🖥️ 서버 작업 가이드 (Remote-SSH 연결 후)

Cursor에서 Remote-SSH로 서버에 연결된 상태에서 할 수 있는 작업들입니다.

## 📍 1. 서버 상태 확인

### 프로젝트 디렉토리 확인
```bash
cd ~/all4fit
pwd
ls -la
```

### Git 상태 확인
```bash
git status
git branch
```

### 서비스 상태 확인
```bash
# Nginx 상태
sudo systemctl status nginx

# PM2 상태 (사용 중인 경우)
pm2 status

# 디스크 사용량
df -h

# 메모리 사용량
free -h
```

---

## 🔄 2. 코드 업데이트 (로컬 → 서버)

### 방법 1: Git Pull (권장)
```bash
cd ~/all4fit
git pull origin main
```

### 방법 2: Cursor에서 직접 파일 편집
- 좌측 탐색기에서 서버 파일 시스템 접근
- 파일을 직접 편집하면 서버에 바로 반영됨
- 저장하면 즉시 적용

### 방법 3: SCP로 파일 전송 (로컬 터미널에서)
```powershell
# 단일 파일
scp -i "C:\Users\jinse\Desktop\all_key\all4fitkey.pem" file.txt ubuntu@3.38.85.149:~/all4fit/

# 전체 디렉토리
scp -i "C:\Users\jinse\Desktop\all_key\all4fitkey.pem" -r ./folder ubuntu@3.38.85.149:~/all4fit/
```

---

## 🚀 3. 배포 작업

### 새 코드 배포
```bash
cd ~/all4fit
git pull
sudo ./scripts/deploy.sh
```

### SSL 인증서 갱신
```bash
cd ~/all4fit
sudo ./scripts/setup-ssl.sh
```

### Nginx 재시작
```bash
sudo nginx -t  # 설정 확인
sudo systemctl reload nginx  # 무중단 재시작
# 또는
sudo systemctl restart nginx  # 완전 재시작
```

---

## 📝 4. 파일 편집 및 관리

### Cursor에서 서버 파일 편집
1. **좌측 탐색기**에서 서버 파일 시스템 탐색
2. 파일을 클릭하면 자동으로 서버에서 열림
3. 편집 후 저장하면 서버에 바로 반영

### 자주 편집하는 파일들
```bash
# Nginx 설정
sudo nano /etc/nginx/sites-available/all4fit
# 또는 Cursor에서 직접 열기

# 프로젝트 파일
~/all4fit/index.html
~/all4fit/css/base.css
~/all4fit/js/*.js
```

---

## 📊 5. 로그 확인

### Nginx 로그
```bash
# 실시간 접속 로그
sudo tail -f /var/log/nginx/all4fit_access.log

# 에러 로그
sudo tail -f /var/log/nginx/all4fit_error.log

# 전체 로그
sudo tail -f /var/log/nginx/error.log
```

### 배포 로그
```bash
tail -f /var/log/all4fit/deploy.log
```

### PM2 로그 (사용 중인 경우)
```bash
pm2 logs
pm2 logs all4fit-web
```

---

## 🔧 6. 자주 쓰는 명령어

### 프로젝트 관련
```bash
cd ~/all4fit                    # 프로젝트 디렉토리로 이동
git status                      # Git 상태 확인
git pull                        # 최신 코드 가져오기
git log --oneline -10           # 최근 커밋 확인
```

### 서비스 관리
```bash
sudo systemctl status nginx     # Nginx 상태
sudo systemctl restart nginx    # Nginx 재시작
sudo systemctl reload nginx     # Nginx 무중단 재시작
pm2 status                      # PM2 상태
pm2 restart all                 # PM2 재시작
```

### 파일 관리
```bash
ls -lah ~/all4fit               # 파일 목록
cat ~/all4fit/package.json      # 파일 내용 보기
nano ~/all4fit/file.txt         # 파일 편집
```

### 권한 관리
```bash
sudo chown -R www-data:www-data /var/www/all4fit
sudo chmod -R 755 /var/www/all4fit
```

---

## 🐛 7. 문제 해결

### Nginx 설정 오류
```bash
sudo nginx -t                   # 설정 문법 확인
sudo systemctl status nginx     # 상태 확인
sudo journalctl -u nginx        # 상세 로그
```

### 파일 권한 문제
```bash
sudo chown -R ubuntu:ubuntu ~/all4fit
sudo chmod +x ~/all4fit/scripts/*.sh
```

### 디스크 공간 부족
```bash
df -h                           # 디스크 사용량
du -sh ~/all4fit/*             # 디렉토리별 크기
sudo apt clean                  # 패키지 캐시 정리
```

---

## 📤 8. 서버 → 로컬 파일 다운로드

### Cursor에서
- 서버 파일을 우클릭 → "Download..." 선택

### SCP로 (로컬 터미널에서)
```powershell
# 단일 파일
scp -i "C:\Users\jinse\Desktop\all_key\all4fitkey.pem" ubuntu@3.38.85.149:~/all4fit/file.txt ./

# 전체 디렉토리
scp -i "C:\Users\jinse\Desktop\all_key\all4fitkey.pem" -r ubuntu@3.38.85.149:~/all4fit/folder ./
```

---

## 🎯 9. 일반적인 워크플로우

### 코드 수정 후 배포
```bash
# 1. 로컬에서 코드 수정 및 커밋
git add .
git commit -m "Update feature"
git push

# 2. 서버에서 최신 코드 가져오기
cd ~/all4fit
git pull

# 3. 배포 실행
sudo ./scripts/deploy.sh

# 4. 확인
curl -I https://all4fit.co.kr
```

### 긴급 수정 (서버에서 직접)
```bash
# 1. 서버에서 파일 직접 편집 (Cursor 사용)
# 2. Nginx 재시작
sudo systemctl reload nginx
```

---

## 💡 팁

### Cursor 터미널 사용
- 서버에 연결되면 터미널이 자동으로 서버 터미널로 전환됨
- 여러 터미널 탭 열기 가능
- 각 탭은 독립적인 SSH 세션

### 파일 동기화
- Cursor에서 저장하면 서버에 즉시 반영
- Git을 사용하면 로컬과 서버 동기화 가능

### 빠른 접근
- `Ctrl+Shift+P` → "Remote-SSH: Connect to Host" → `all4fit-ec2`
- 또는 터미널에서: `ssh all4fit-ec2`

---

## 🔐 보안 주의사항

- 서버에서 작업 후 항상 `exit`로 연결 종료
- 민감한 정보는 환경 변수나 `.env` 파일 사용
- 키 파일은 절대 공유하지 않기
- 정기적으로 서버 로그 확인

