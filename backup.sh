#!/bin/bash

# 모두의핏 웹사이트 백업 스크립트

set -e

# 설정 변수
PROJECT_NAME="all4fit"
WEB_ROOT="/var/www/$PROJECT_NAME"
BACKUP_DIR="/var/backups/$PROJECT_NAME"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.tar.gz"

# 색상 코드
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}📦 백업을 시작합니다...${NC}"

# 백업 디렉토리 생성
mkdir -p $BACKUP_DIR

# 웹사이트 백업
tar -czf $BACKUP_FILE -C /var/www $PROJECT_NAME

# 7일 이상 된 백업 파일 삭제
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +7 -delete

echo -e "${GREEN}✅ 백업이 완료되었습니다: $BACKUP_FILE${NC}"

# 백업 파일 크기 확인
BACKUP_SIZE=$(du -h $BACKUP_FILE | cut -f1)
echo -e "${GREEN}📊 백업 파일 크기: $BACKUP_SIZE${NC}"
