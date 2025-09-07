#!/bin/bash

# PM2 무중단 서비스 설정 스크립트

set -e

# 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 PM2 무중단 서비스 설정을 시작합니다...${NC}"

# 1. Node.js 설치 확인
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}📦 Node.js를 설치합니다...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# 2. PM2 설치
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}📦 PM2를 설치합니다...${NC}"
    sudo npm install -g pm2
fi

# 3. PM2 로그 디렉토리 생성
echo -e "${YELLOW}📁 로그 디렉토리를 생성합니다...${NC}"
sudo mkdir -p /var/log/all4fit
sudo mkdir -p /var/log/all4fit-dev
sudo chown -R $USER:$USER /var/log/all4fit
sudo chown -R $USER:$USER /var/log/all4fit-dev

# 4. PM2 설정 파일 복사
echo -e "${YELLOW}⚙️  PM2 설정을 복사합니다...${NC}"
cp ecosystem.config.js /var/www/all4fit/
cp ecosystem.config.js /var/www/all4fit-dev/

# 5. PM2 서비스 등록
echo -e "${YELLOW}🔧 PM2 서비스를 등록합니다...${NC}"
cd /var/www/all4fit
pm2 start ecosystem.config.js --env production

cd /var/www/all4fit-dev
pm2 start ecosystem.config.js --env development

# 6. PM2 자동 시작 설정
echo -e "${YELLOW}🔄 PM2 자동 시작을 설정합니다...${NC}"
pm2 startup
pm2 save

# 7. PM2 모니터링 설정
echo -e "${YELLOW}📊 PM2 모니터링을 설정합니다...${NC}"
pm2 install pm2-logrotate

# 8. PM2 웹 인터페이스 설정 (선택사항)
echo -e "${YELLOW}🌐 PM2 웹 인터페이스를 설정합니다...${NC}"
pm2 install pm2-server-monit

# 9. 서비스 상태 확인
echo -e "${YELLOW}✅ 서비스 상태를 확인합니다...${NC}"
pm2 status
pm2 logs --lines 10

echo -e "${GREEN}🎉 PM2 무중단 서비스 설정이 완료되었습니다!${NC}"
echo -e "${BLUE}📋 사용 가능한 명령어:${NC}"
echo -e "  pm2 status                    # 서비스 상태 확인"
echo -e "  pm2 logs                      # 로그 확인"
echo -e "  pm2 restart all               # 모든 서비스 재시작"
echo -e "  pm2 reload all                # 무중단 재시작"
echo -e "  pm2 stop all                  # 모든 서비스 중지"
echo -e "  pm2 delete all                # 모든 서비스 삭제"
echo -e "  pm2 monit                     # 모니터링 대시보드"
echo -e "  pm2 web                       # 웹 인터페이스"
