#!/bin/bash

# 모두의핏 웹사이트 배포 스크립트 (Git Pull 포함)
# AWS EC2 Ubuntu 환경에서 실행
# 사용법: ./scripts/deploy-with-git.sh [branch-name]

set -e

# 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 설정 변수
PROJECT_NAME="all4fit"
PROJECT_DIR="$HOME/$PROJECT_NAME"
WEB_ROOT="/var/www/$PROJECT_NAME"
BACKUP_DIR="/var/backups/$PROJECT_NAME"
LOG_FILE="/var/log/$PROJECT_NAME/deploy.log"
BRANCH="${1:-main}"  # 기본값: main

echo -e "${BLUE}🚀 모두의핏 웹사이트 배포를 시작합니다...${NC}"
echo -e "${BLUE}📦 브랜치: $BRANCH${NC}"

# 로그 디렉토리 생성
sudo mkdir -p /var/log/$PROJECT_NAME
sudo chown $USER:$USER /var/log/$PROJECT_NAME

# 로그 함수
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a $LOG_FILE
}

log "배포 시작 (브랜치: $BRANCH)"

# 프로젝트 디렉토리 확인
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}❌ 프로젝트 디렉토리를 찾을 수 없습니다: $PROJECT_DIR${NC}"
    exit 1
fi

cd $PROJECT_DIR

# Git 상태 확인
log "Git 상태 확인 중..."
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ Git 저장소가 아닙니다.${NC}"
    exit 1
fi

# 현재 브랜치 확인
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${YELLOW}현재 브랜치: $CURRENT_BRANCH${NC}"

# 변경사항 확인
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  로컬 변경사항이 있습니다.${NC}"
    git status
    read -p "계속하시겠습니까? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}배포가 취소되었습니다.${NC}"
        exit 0
    fi
fi

# Git Pull
log "Git Pull 실행 중..."
echo -e "${YELLOW}🔄 최신 코드를 가져오는 중...${NC}"
git fetch origin

# 브랜치 전환 (필요한 경우)
if [ "$CURRENT_BRANCH" != "$BRANCH" ]; then
    echo -e "${YELLOW}브랜치 전환: $CURRENT_BRANCH → $BRANCH${NC}"
    git checkout $BRANCH
fi

# Pull 실행
if git pull origin $BRANCH; then
    echo -e "${GREEN}✅ Git Pull 완료${NC}"
    log "Git Pull 완료"
else
    echo -e "${RED}❌ Git Pull 실패${NC}"
    log "Git Pull 실패"
    exit 1
fi

# 최근 커밋 정보
echo -e "${BLUE}📝 최근 커밋:${NC}"
git log --oneline -5

# 백업 생성
log "백업 생성 중..."
if [ -d "$WEB_ROOT" ] && [ "$(ls -A $WEB_ROOT)" ]; then
    sudo mkdir -p $BACKUP_DIR
    BACKUP_NAME="backup_$(date +%Y%m%d_%H%M%S)"
    sudo cp -r $WEB_ROOT $BACKUP_DIR/$BACKUP_NAME
    echo -e "${GREEN}✅ 백업 완료: $BACKUP_DIR/$BACKUP_NAME${NC}"
    log "백업 완료: $BACKUP_NAME"
fi

# 파일 복사
log "파일 복사 중..."
sudo mkdir -p $WEB_ROOT
sudo cp -r $PROJECT_DIR/* $WEB_ROOT/ 2>/dev/null || true
sudo rm -rf $WEB_ROOT/.git $WEB_ROOT/scripts $WEB_ROOT/.vscode 2>/dev/null || true
sudo chown -R www-data:www-data $WEB_ROOT
sudo chmod -R 755 $WEB_ROOT
echo -e "${GREEN}✅ 파일 복사 완료${NC}"
log "파일 복사 완료"

# Nginx 설정
log "Nginx 설정 중..."
if [ -f "/etc/letsencrypt/live/all4fit.co.kr/fullchain.pem" ]; then
    echo -e "${GREEN}✅ SSL 인증서가 발견되었습니다. HTTPS 설정을 사용합니다.${NC}"
    sudo cp $PROJECT_DIR/config/nginx-ip-redirect.conf /etc/nginx/sites-available/$PROJECT_NAME
else
    echo -e "${YELLOW}⚠️  SSL 인증서가 없습니다. HTTP 설정을 사용합니다.${NC}"
    sudo cp $PROJECT_DIR/config/nginx-http.conf /etc/nginx/sites-available/$PROJECT_NAME
fi
sudo ln -sf /etc/nginx/sites-available/$PROJECT_NAME /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Nginx 설정 테스트
log "Nginx 설정 테스트 중..."
if sudo nginx -t; then
    echo -e "${GREEN}✅ Nginx 설정이 올바릅니다${NC}"
else
    echo -e "${RED}❌ Nginx 설정에 오류가 있습니다${NC}"
    log "Nginx 설정 오류"
    exit 1
fi

# Nginx 재시작
log "Nginx 재시작 중..."
sudo systemctl reload nginx
echo -e "${GREEN}✅ Nginx 재시작 완료${NC}"
log "Nginx 재시작 완료"

# 배포 완료
log "배포 완료!"
echo -e "${GREEN}🎉 배포가 성공적으로 완료되었습니다!${NC}"
echo -e "${BLUE}📋 배포 정보:${NC}"
echo -e "  브랜치: $BRANCH"
echo -e "  커밋: $(git rev-parse --short HEAD)"
echo -e "  메시지: $(git log -1 --pretty=format:'%s')"
echo -e "  시간: $(date '+%Y-%m-%d %H:%M:%S')"
echo -e ""
echo -e "${BLUE}🌐 사이트 확인:${NC}"
echo -e "  https://all4fit.co.kr"
echo -e ""
echo -e "${BLUE}📊 로그 확인:${NC}"
echo -e "  tail -f $LOG_FILE"

