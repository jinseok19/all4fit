#!/bin/bash

# 모두의핏 웹사이트 배포 스크립트
# AWS EC2 Ubuntu 환경에서 실행

set -e

# 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 설정 변수
PROJECT_NAME="all4fit"
WEB_ROOT="/var/www/$PROJECT_NAME"
BACKUP_DIR="/var/backups/$PROJECT_NAME"
LOG_FILE="/var/log/$PROJECT_NAME/deploy.log"

echo -e "${BLUE}🚀 모두의핏 웹사이트 배포를 시작합니다...${NC}"

# 로그 디렉토리 생성
sudo mkdir -p /var/log/$PROJECT_NAME
sudo chown $USER:$USER /var/log/$PROJECT_NAME

# 로그 함수
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a $LOG_FILE
}

log "배포 시작"

# 1. 시스템 업데이트
log "시스템 패키지 업데이트 중..."
sudo apt update && sudo apt upgrade -y

# 2. 필요한 패키지 설치
log "필요한 패키지 설치 중..."
sudo apt install -y nginx certbot python3-certbot-nginx git curl wget unzip

# 3. Node.js 및 PM2 설치
log "Node.js 및 PM2 설치 중..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
fi

# serve 패키지 설치 (정적 파일 서빙용)
if ! command -v serve &> /dev/null; then
    sudo npm install -g serve
fi

# 4. 웹 디렉토리 생성
log "웹 디렉토리 설정 중..."
sudo mkdir -p $WEB_ROOT
sudo chown -R $USER:www-data $WEB_ROOT
sudo chmod -R 755 $WEB_ROOT

# 5. 백업 생성 (기존 파일이 있는 경우)
if [ -d "$WEB_ROOT" ] && [ "$(ls -A $WEB_ROOT)" ]; then
    log "기존 파일 백업 중..."
    sudo mkdir -p $BACKUP_DIR
    sudo cp -r $WEB_ROOT $BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S)
fi

# 6. 프로젝트 파일 복사
log "프로젝트 파일 복사 중..."
sudo cp -r . $WEB_ROOT/
sudo chown -R www-data:www-data $WEB_ROOT
sudo chmod -R 755 $WEB_ROOT

# 7. Nginx 설정
log "Nginx 설정 중..."
# SSL 인증서가 있는지 확인
SSL_CERT="/etc/letsencrypt/live/all4fit.co.kr/fullchain.pem"

if [ -f "$SSL_CERT" ]; then
    # 만료된 인증서 파일도 "존재"는 하므로, 배포 시 갱신을 먼저 시도하고 유효성 체크
    log "SSL 인증서가 발견되었습니다. 갱신을 시도합니다..."
    sudo certbot renew --quiet || true

    if command -v openssl >/dev/null 2>&1 && openssl x509 -in "$SSL_CERT" -noout -checkend 86400 >/dev/null 2>&1; then
        echo -e "${GREEN}✅ 유효한 SSL 인증서입니다. HTTPS 설정을 사용합니다.${NC}"
        sudo cp nginx.conf /etc/nginx/sites-available/$PROJECT_NAME
    else
        echo -e "${YELLOW}⚠️  SSL 인증서가 만료/무효입니다. 임시로 HTTP 설정을 사용합니다.${NC}"
        echo -e "${YELLOW}   (서버에서 sudo ./setup-ssl.sh 실행 후 다시 배포하세요)${NC}"
        sudo cp nginx-http.conf /etc/nginx/sites-available/$PROJECT_NAME
    fi
else
    echo -e "${YELLOW}⚠️  SSL 인증서가 없습니다. HTTP 설정을 사용합니다.${NC}"
    sudo cp nginx-http.conf /etc/nginx/sites-available/$PROJECT_NAME
fi
sudo ln -sf /etc/nginx/sites-available/$PROJECT_NAME /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# 8. Nginx 설정 테스트
log "Nginx 설정 테스트 중..."
if sudo nginx -t; then
    echo -e "${GREEN}✅ Nginx 설정이 올바릅니다${NC}"
else
    echo -e "${RED}❌ Nginx 설정에 오류가 있습니다${NC}"
    echo -e "${YELLOW}설정 파일을 확인하고 다시 시도하세요${NC}"
    exit 1
fi

# 9. Nginx 재시작
log "Nginx 재시작 중..."
sudo systemctl restart nginx
sudo systemctl enable nginx

# 10. 방화벽 설정
log "방화벽 설정 중..."
sudo ufw allow 'Nginx Full'
sudo ufw allow ssh
sudo ufw --force enable

# 11. 기본 서버 설정 완료
log "기본 서버 설정이 완료되었습니다."

# 12. 서비스 상태 확인
log "서비스 상태 확인 중..."
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ Nginx가 정상적으로 실행 중입니다${NC}"
else
    echo -e "${RED}❌ Nginx 실행에 문제가 있습니다${NC}"
    sudo systemctl status nginx
    exit 1
fi

# 13. 웹사이트 접근 테스트
log "웹사이트 접근 테스트 중..."
if curl -f http://localhost > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 웹사이트가 정상적으로 접근 가능합니다${NC}"
else
    echo -e "${RED}❌ 웹사이트 접근에 문제가 있습니다${NC}"
    exit 1
fi

# 13. 성능 최적화
log "성능 최적화 설정 중..."

# Nginx worker 프로세스 수 조정
CPU_CORES=$(nproc)
sudo sed -i "s/worker_processes auto;/worker_processes $CPU_CORES;/" /etc/nginx/nginx.conf

# 파일 디스크립터 제한 증가
echo "* soft nofile 65535" | sudo tee -a /etc/security/limits.conf
echo "* hard nofile 65535" | sudo tee -a /etc/security/limits.conf

# 14. 모니터링 설정
log "모니터링 설정 중..."
sudo mkdir -p /var/log/nginx
sudo chown www-data:www-data /var/log/nginx

# 15. 자동 백업 설정
log "자동 백업 설정 중..."
(crontab -l 2>/dev/null; echo "0 2 * * * /bin/bash $PWD/backup.sh") | crontab -

log "배포 완료!"

echo -e "${GREEN}🎉 배포가 성공적으로 완료되었습니다!${NC}"
echo -e "${BLUE}📋 다음 단계:${NC}"
echo -e "1. 도메인 설정: sudo ./setup-ssl.sh"
echo -e "2. 웹사이트 확인: http://$(curl -s ifconfig.me)"
echo -e "3. 로그 확인: tail -f $LOG_FILE"
echo -e "4. Nginx 상태: sudo systemctl status nginx"
