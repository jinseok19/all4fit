#!/bin/bash

# 무중단 배포 스크립트
# PM2를 사용한 Zero-downtime deployment

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

echo -e "${BLUE}🚀 무중단 배포를 시작합니다...${NC}"

# 로그 디렉토리 생성
sudo mkdir -p /var/log/$PROJECT_NAME
sudo chown $USER:$USER /var/log/$PROJECT_NAME

# 로그 함수
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a $LOG_FILE
}

log "무중단 배포 시작"

# 1. 현재 PM2 상태 확인
log "현재 PM2 상태 확인 중..."
pm2 status

# 2. 백업 생성
log "현재 버전 백업 중..."
sudo mkdir -p $BACKUP_DIR
sudo cp -r $WEB_ROOT $BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S)

# 3. 새 파일 복사
log "새 파일 복사 중..."
sudo cp -r . $WEB_ROOT/
sudo chown -R www-data:www-data $WEB_ROOT
sudo chmod -R 755 $WEB_ROOT

# 4. PM2 무중단 재시작
log "PM2 무중단 재시작 중..."
cd $WEB_ROOT

# 프로덕션 환경 무중단 재시작
pm2 reload all4fit-web --update-env

# 5. 헬스 체크
log "헬스 체크 중..."
sleep 5

# PM2 상태 확인
if pm2 list | grep -q "all4fit-web.*online"; then
    echo -e "${GREEN}✅ 무중단 배포 성공!${NC}"
    log "무중단 배포 성공"
else
    echo -e "${RED}❌ 배포 실패! 롤백을 시작합니다...${NC}"
    log "배포 실패, 롤백 시작"
    
    # 롤백
    LATEST_BACKUP=$(ls -t $BACKUP_DIR | head -1)
    sudo cp -r $BACKUP_DIR/$LATEST_BACKUP/* $WEB_ROOT/
    sudo chown -R www-data:www-data $WEB_ROOT
    pm2 reload all4fit-web
    echo -e "${YELLOW}🔄 롤백 완료${NC}"
    exit 1
fi

# 6. Nginx 설정 테스트 및 재시작
log "Nginx 설정 테스트 중..."
if sudo nginx -t; then
    sudo systemctl reload nginx
    echo -e "${GREEN}✅ Nginx 설정 업데이트 완료${NC}"
else
    echo -e "${RED}❌ Nginx 설정 오류${NC}"
    exit 1
fi

log "무중단 배포 완료!"

echo -e "${GREEN}🎉 무중단 배포가 성공적으로 완료되었습니다!${NC}"
echo -e "${BLUE}📋 배포 정보:${NC}"
echo -e "🌐 웹사이트: http://all4fit.co.kr"
echo -e "📊 PM2 상태: pm2 status"
echo -e "📋 로그 확인: pm2 logs all4fit-web"
echo -e "🔄 무중단 재시작: pm2 reload all4fit-web"
