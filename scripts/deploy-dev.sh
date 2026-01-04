#!/bin/bash

# 모두의핏 개발 환경 배포 스크립트
# dev.all4fit.co.kr 서브도메인용

set -e

# 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 설정 변수
PROJECT_NAME="all4fit-dev"
WEB_ROOT="/var/www/$PROJECT_NAME"
LOG_FILE="/var/log/$PROJECT_NAME/deploy.log"

echo -e "${BLUE}🚀 모두의핏 개발 환경 배포를 시작합니다...${NC}"

# 로그 디렉토리 생성
sudo mkdir -p /var/log/$PROJECT_NAME
sudo chown $USER:$USER /var/log/$PROJECT_NAME

# 로그 함수
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a $LOG_FILE
}

log "개발 환경 배포 시작"

# 1. 개발 디렉토리 생성
log "개발 디렉토리 설정 중..."
sudo mkdir -p $WEB_ROOT
sudo chown -R $USER:www-data $WEB_ROOT
sudo chmod -R 755 $WEB_ROOT

# 2. 프로젝트 파일 복사
log "개발 환경 파일 복사 중..."
sudo cp -r . $WEB_ROOT/
sudo chown -R www-data:www-data $WEB_ROOT
sudo chmod -R 755 $WEB_ROOT

# 3. 개발 환경용 설정 파일 생성
log "개발 환경 설정 파일 생성 중..."
cat > $WEB_ROOT/dev-config.js << 'EOF'
// 개발 환경 설정
window.DEV_CONFIG = {
    environment: 'development',
    apiUrl: 'https://dev.all4fit.co.kr/api',
    debug: true,
    logLevel: 'debug',
    cacheTime: 0, // 개발용으로 캐시 비활성화
    version: '1.0.0-dev'
};
EOF

# 4. 개발용 HTML 파일 수정 (개발 환경 표시)
log "개발 환경 HTML 수정 중..."
sudo sed -i 's/<title>모두의핏/<title>[DEV] 모두의핏/g' $WEB_ROOT/index.html

# 5. Nginx 설정 테스트
log "Nginx 설정 테스트 중..."
sudo nginx -t

# 6. Nginx 재시작
log "Nginx 재시작 중..."
sudo systemctl reload nginx

log "개발 환경 배포 완료!"

echo -e "${GREEN}🎉 개발 환경 배포가 성공적으로 완료되었습니다!${NC}"
echo -e "${BLUE}📋 접속 정보:${NC}"
echo -e "🌐 개발 사이트: https://dev.all4fit.co.kr"
echo -e "📊 로그 확인: tail -f $LOG_FILE"
echo -e "🔧 설정 파일: $WEB_ROOT/dev-config.js"
