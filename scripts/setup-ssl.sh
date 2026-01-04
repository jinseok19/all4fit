#!/bin/bash

# SSL 인증서 설정 스크립트
# Let's Encrypt를 사용하여 무료 SSL 인증서 발급

set -euo pipefail

# 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}SSL 인증서 설정을 시작합니다...${NC}"

# 도메인 설정
DOMAIN="all4fit.co.kr"
EMAIL="admin@$DOMAIN"
WEBROOT="/var/www/letsencrypt"
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

# ACME(webroot) 디렉토리 준비
echo -e "${YELLOW}ACME(webroot) 디렉토리를 준비합니다...${NC}"
sudo mkdir -p "$WEBROOT/.well-known/acme-challenge"
sudo chown -R www-data:www-data "$WEBROOT"
sudo chmod -R 755 "$WEBROOT"

# 1) 먼저 HTTP 설정으로 Nginx 올림 (인증서 없을 때 443 설정 로드하면 nginx -t가 깨짐)
echo -e "${YELLOW}임시 HTTP 설정으로 Nginx를 구성합니다...${NC}"
sudo cp nginx-http.conf /etc/nginx/sites-available/all4fit
sudo ln -sf /etc/nginx/sites-available/all4fit /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# 2) SSL 인증서 발급/갱신 (메인 도메인 + 서브도메인) - 무중단(webroot)
echo -e "${YELLOW}SSL 인증서를 발급/갱신합니다...${NC}"
sudo certbot certonly \
  --webroot -w "$WEBROOT" \
  --cert-name "$DOMAIN" \
  -d "$DOMAIN" -d "www.$DOMAIN" -d "prod.$DOMAIN" -d "dev.$DOMAIN" \
  --non-interactive --agree-tos --email "$EMAIL" \
  --keep-until-expiring

# Nginx 설정 파일 업데이트
echo -e "${YELLOW}Nginx(HTTPS) 설정을 업데이트합니다...${NC}"
sudo cp nginx-ip-redirect.conf /etc/nginx/sites-available/all4fit

# 사이트 활성화
sudo ln -sf /etc/nginx/sites-available/all4fit /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Nginx 설정 테스트
echo -e "${YELLOW}Nginx 설정을 테스트합니다...${NC}"
sudo nginx -t

# Nginx 리로드
echo -e "${YELLOW}Nginx를 리로드합니다...${NC}"
sudo systemctl reload nginx
sudo systemctl enable nginx

# 자동 갱신 설정 (systemd timer 우선 + 갱신 후 nginx reload hook)
echo -e "${YELLOW}자동 갱신을 설정합니다...${NC}"
sudo mkdir -p /etc/letsencrypt/renewal-hooks/deploy
cat <<'EOF' | sudo tee /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh >/dev/null
#!/bin/sh
systemctl reload nginx
EOF
sudo chmod +x /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh

sudo systemctl enable --now certbot.timer >/dev/null 2>&1 || true

# 기존 크론에 certbot renew가 있으면 제거 (standalone 방식에서 실패했던 흔적 제거)
TMP_CRON="$(mktemp)"
crontab -l 2>/dev/null | grep -v "certbot renew" > "$TMP_CRON" || true
crontab "$TMP_CRON" || true
rm -f "$TMP_CRON"

echo -e "${GREEN}✅ SSL 인증서 설정이 완료되었습니다!${NC}"
echo -e "${GREEN}🌐 https://$DOMAIN 으로 접속하세요${NC}"
