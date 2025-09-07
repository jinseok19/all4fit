#!/bin/bash

# SSL 인증서 설정 스크립트
# Let's Encrypt를 사용하여 무료 SSL 인증서 발급

set -e

# 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔒 SSL 인증서 설정을 시작합니다...${NC}"

# 도메인 설정
DOMAIN="all4fit.co.kr"
echo -e "${GREEN}🌐 도메인: $DOMAIN${NC}"
echo -e "${GREEN}🌐 서브도메인: prod.$DOMAIN, dev.$DOMAIN${NC}"

# Nginx 설치 확인
if ! command -v nginx &> /dev/null; then
    echo -e "${YELLOW}📦 Nginx를 설치합니다...${NC}"
    sudo apt update
    sudo apt install -y nginx
fi

# Certbot 설치
if ! command -v certbot &> /dev/null; then
    echo -e "${YELLOW}📦 Certbot을 설치합니다...${NC}"
    sudo apt install -y certbot python3-certbot-nginx
fi

# Nginx 중지 (인증서 발급을 위해)
echo -e "${YELLOW}⏸️  Nginx를 중지합니다...${NC}"
sudo systemctl stop nginx

# SSL 인증서 발급 (메인 도메인 + 서브도메인)
echo -e "${YELLOW}🔐 SSL 인증서를 발급합니다...${NC}"
sudo certbot certonly --standalone -d $DOMAIN -d www.$DOMAIN -d prod.$DOMAIN -d dev.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN

# Nginx 설정 파일 업데이트
echo -e "${YELLOW}⚙️  Nginx 설정을 업데이트합니다...${NC}"
sudo cp nginx.conf /etc/nginx/sites-available/all4fit

# 사이트 활성화
sudo ln -sf /etc/nginx/sites-available/all4fit /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Nginx 설정 테스트
echo -e "${YELLOW}🧪 Nginx 설정을 테스트합니다...${NC}"
sudo nginx -t

# Nginx 시작
echo -e "${YELLOW}🚀 Nginx를 시작합니다...${NC}"
sudo systemctl start nginx
sudo systemctl enable nginx

# 자동 갱신 설정
echo -e "${YELLOW}🔄 자동 갱신을 설정합니다...${NC}"
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -

echo -e "${GREEN}✅ SSL 인증서 설정이 완료되었습니다!${NC}"
echo -e "${GREEN}🌐 https://$DOMAIN 으로 접속하세요${NC}"
