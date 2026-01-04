#!/bin/bash

# PM2 고급 설정 스크립트 (선택사항)
# 기본 서버 설정 완료 후 실행

set -e

# 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 PM2 고급 설정을 시작합니다...${NC}"

# 1. serve 패키지 설치 확인
if ! command -v serve &> /dev/null; then
    echo -e "${YELLOW}📦 serve 패키지를 설치합니다...${NC}"
    sudo npm install -g serve
fi

# 2. PM2 로그 디렉토리 생성
echo -e "${YELLOW}📁 PM2 로그 디렉토리를 생성합니다...${NC}"
sudo mkdir -p /var/log/all4fit
sudo mkdir -p /var/log/all4fit-dev
sudo chown -R $USER:$USER /var/log/all4fit
sudo chown -R $USER:$USER /var/log/all4fit-dev

# 3. PM2 정리
echo -e "${YELLOW}🧹 PM2 서비스를 정리합니다...${NC}"
pm2 delete all 2>/dev/null || true
pm2 kill 2>/dev/null || true

# 4. PM2 설정 파일 복사
echo -e "${YELLOW}⚙️  PM2 설정을 복사합니다...${NC}"
sudo cp ecosystem.config.js /var/www/all4fit/
sudo chown www-data:www-data /var/www/all4fit/ecosystem.config.js

# 5. PM2 시작
echo -e "${YELLOW}🚀 PM2 서비스를 시작합니다...${NC}"
cd /var/www/all4fit
pm2 start ecosystem.config.js --env production

# 6. PM2 자동 시작 설정
echo -e "${YELLOW}🔄 PM2 자동 시작을 설정합니다...${NC}"
pm2 startup
pm2 save

# 7. 상태 확인
echo -e "${YELLOW}📊 PM2 상태를 확인합니다...${NC}"
pm2 status

# 8. Nginx 설정을 PM2 프록시로 변경
echo -e "${YELLOW}🔄 Nginx 설정을 PM2 프록시로 변경합니다...${NC}"
sudo cp nginx-pm2.conf /etc/nginx/sites-available/all4fit 2>/dev/null || {
    echo -e "${YELLOW}⚠️  nginx-pm2.conf 파일이 없습니다. 수동으로 설정하세요.${NC}"
}

# 9. Nginx 재시작
echo -e "${YELLOW}🔄 Nginx를 재시작합니다...${NC}"
sudo nginx -t && sudo systemctl reload nginx

echo -e "${GREEN}🎉 PM2 고급 설정이 완료되었습니다!${NC}"
echo -e "${BLUE}📋 사용 가능한 명령어:${NC}"
echo -e "  pm2 status                    # PM2 상태 확인"
echo -e "  pm2 logs                      # PM2 로그 확인"
echo -e "  pm2 reload all4fit-web        # 무중단 재시작"
echo -e "  pm2 monit                     # 모니터링 대시보드"
echo -e "  ./deploy-zero-downtime.sh     # 무중단 배포"
