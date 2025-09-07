# 🚀 모두의핏 AWS EC2 배포 가이드

AWS EC2 Ubuntu 환경에서 모두의핏 웹사이트를 배포하는 완전한 가이드입니다.

## 📋 사전 준비사항

### 1. AWS EC2 인스턴스 준비
- **OS**: Ubuntu 20.04 LTS 이상
- **인스턴스 타입**: t2.micro (무료 티어) 또는 t3.small
- **스토리지**: 최소 8GB
- **보안 그룹**: HTTP(80), HTTPS(443), SSH(22) 포트 열기

### 2. 도메인 준비 (선택사항)
- 도메인을 소유하고 있다면 DNS A 레코드를 EC2 퍼블릭 IP로 설정
- 도메인이 없다면 EC2 퍼블릭 IP로 직접 접속 가능

## 🛠️ 배포 단계

### 1단계: EC2 인스턴스 접속
```bash
ssh -i your-key.pem ubuntu@your-ec2-public-ip
```

### 2단계: 프로젝트 파일 업로드
```bash
# 방법 1: Git 사용 (권장)
git clone https://github.com/your-username/all4fit.git
cd all4fit

# 방법 2: SCP 사용
scp -i your-key.pem -r ./all4fit ubuntu@your-ec2-public-ip:/home/ubuntu/
```

### 3단계: 배포 스크립트 실행 권한 부여
```bash
chmod +x *.sh
```

### 4단계: 자동 배포 실행
```bash
./deploy.sh
```

### 5단계: SSL 인증서 설정
```bash
./setup-ssl.sh
```

### 6단계: 개발 환경 배포 (선택사항)
```bash
./deploy-dev.sh
```

### 7단계: PM2 무중단 서비스 설정 (선택사항)
```bash
./setup-pm2.sh
```

## 📁 배포 파일 구조

```
all4fit/
├── index.html                 # 메인 페이지
├── css/                      # 스타일시트
├── js/                       # JavaScript 파일
├── components/               # 컴포넌트
├── data/                     # JSON 데이터
├── images/                   # 이미지 파일
├── videos/                   # 비디오 파일
├── nginx.conf               # Nginx 설정
├── deploy.sh                # 배포 스크립트
├── deploy-dev.sh            # 개발 환경 배포 스크립트
├── setup-ssl.sh             # SSL 설정 스크립트
├── setup-pm2.sh             # PM2 설정 스크립트
├── pm2-commands.sh          # PM2 관리 명령어
├── ecosystem.config.js      # PM2 설정 파일
├── backup.sh                # 백업 스크립트
├── monitor.sh               # 모니터링 스크립트
├── all4fit.service          # 시스템 서비스
├── env.example              # 환경 변수 예시
└── package.json             # 프로젝트 설정
```

## 🔧 주요 스크립트 설명

### `deploy.sh` - 메인 배포 스크립트
- 시스템 패키지 업데이트
- Nginx 설치 및 설정
- 웹사이트 파일 복사
- 방화벽 설정
- 성능 최적화

### `setup-ssl.sh` - SSL 인증서 설정
- Let's Encrypt 인증서 발급
- Nginx SSL 설정
- 자동 갱신 설정

### `backup.sh` - 백업 스크립트
- 웹사이트 파일 백업
- 오래된 백업 파일 정리

### `monitor.sh` - 모니터링 스크립트
- 시스템 상태 확인
- 웹사이트 응답 확인
- 로그 확인

### `setup-pm2.sh` - PM2 무중단 서비스 설정
- Node.js 및 PM2 설치
- PM2 서비스 등록
- 자동 시작 설정
- 모니터링 설정

### `pm2-commands.sh` - PM2 관리 명령어
- 서비스 상태 확인
- 서비스 시작/중지/재시작
- 무중단 재시작 (reload)
- 로그 확인
- 모니터링 대시보드

### `ecosystem.config.js` - PM2 설정 파일
- 프로덕션/개발 환경 설정
- 자동 재시작 설정
- 로그 관리
- 메모리 제한 설정

## 🌐 접속 확인

### HTTP 접속
```
http://3.38.85.149
```

### HTTPS 접속 (SSL 설정 후)
```
https://all4fit.co.kr          # 메인 사이트
https://www.all4fit.co.kr       # www 서브도메인
https://prod.all4fit.co.kr      # 프로덕션 서브도메인
https://dev.all4fit.co.kr       # 개발 서브도메인
```

## 📊 모니터링 및 관리

### 서비스 상태 확인
```bash
sudo systemctl status nginx
```

### 로그 확인
```bash
# 접속 로그
tail -f /var/log/nginx/access.log

# 에러 로그
tail -f /var/log/nginx/error.log

# 배포 로그
tail -f /var/log/all4fit/deploy.log
```

### 모니터링 실행
```bash
./monitor.sh
```

### 백업 실행
```bash
./backup.sh
```

### PM2 관리
```bash
# PM2 상태 확인
pm2 status

# PM2 로그 확인
pm2 logs

# 무중단 재시작
pm2 reload all

# PM2 모니터링 대시보드
pm2 monit

# PM2 관리 명령어 메뉴
./pm2-commands.sh
```

## 🔄 업데이트 배포

### 1. 코드 업데이트
```bash
git pull origin main
```

### 2. 재배포
```bash
./deploy.sh
```

## 🛡️ 보안 설정

### 방화벽 설정
```bash
sudo ufw status
sudo ufw allow 'Nginx Full'
sudo ufw allow ssh
```

### SSL 인증서 갱신
```bash
sudo certbot renew --dry-run
```

## 🚨 문제 해결

### Nginx 시작 실패
```bash
sudo nginx -t  # 설정 파일 문법 확인
sudo systemctl status nginx
sudo journalctl -u nginx
```

### 권한 문제
```bash
sudo chown -R www-data:www-data /var/www/all4fit
sudo chmod -R 755 /var/www/all4fit
```

### 포트 충돌
```bash
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443
```

## 📈 성능 최적화

### Nginx 설정 최적화
- Gzip 압축 활성화
- 정적 파일 캐싱
- HTTP/2 지원

### 시스템 최적화
- 파일 디스크립터 제한 증가
- Worker 프로세스 수 조정

## 🔧 환경 변수 설정

`env.example` 파일을 `.env`로 복사하고 실제 값으로 수정:

```bash
cp env.example .env
nano .env
```

## 📞 지원

문제가 발생하면 다음을 확인하세요:

1. **로그 파일**: `/var/log/nginx/error.log`
2. **서비스 상태**: `sudo systemctl status nginx`
3. **포트 사용**: `sudo netstat -tlnp`
4. **권한 설정**: `ls -la /var/www/all4fit`

---

## 🎉 배포 완료!

모든 설정이 완료되면 웹사이트에 접속하여 정상 작동을 확인하세요.

**접속 URL**: `http://your-ec2-public-ip` 또는 `https://your-domain.com`
