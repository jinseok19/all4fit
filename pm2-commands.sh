#!/bin/bash

# PM2 관리 명령어 스크립트

# 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 명령어 선택
echo -e "${BLUE}🔧 PM2 관리 명령어를 선택하세요:${NC}"
echo -e "1. 서비스 상태 확인"
echo -e "2. 서비스 시작"
echo -e "3. 서비스 중지"
echo -e "4. 서비스 재시작"
echo -e "5. 무중단 재시작 (reload)"
echo -e "6. 로그 확인"
echo -e "7. 모니터링 대시보드"
echo -e "8. 웹 인터페이스"
echo -e "9. 서비스 삭제"
echo -e "10. 모든 서비스 관리"

read -p "선택하세요 (1-10): " choice

case $choice in
    1)
        echo -e "${GREEN}📊 서비스 상태 확인${NC}"
        pm2 status
        ;;
    2)
        echo -e "${GREEN}🚀 서비스 시작${NC}"
        pm2 start ecosystem.config.js
        ;;
    3)
        echo -e "${YELLOW}⏸️  서비스 중지${NC}"
        pm2 stop all
        ;;
    4)
        echo -e "${YELLOW}🔄 서비스 재시작${NC}"
        pm2 restart all
        ;;
    5)
        echo -e "${GREEN}🔄 무중단 재시작${NC}"
        pm2 reload all
        ;;
    6)
        echo -e "${BLUE}📋 로그 확인${NC}"
        echo -e "1. 전체 로그"
        echo -e "2. 에러 로그만"
        echo -e "3. 실시간 로그"
        read -p "선택하세요 (1-3): " log_choice
        case $log_choice in
            1) pm2 logs ;;
            2) pm2 logs --err ;;
            3) pm2 logs --follow ;;
        esac
        ;;
    7)
        echo -e "${BLUE}📊 모니터링 대시보드${NC}"
        pm2 monit
        ;;
    8)
        echo -e "${BLUE}🌐 웹 인터페이스${NC}"
        echo -e "웹 인터페이스가 시작됩니다. 브라우저에서 http://localhost:9615 접속하세요."
        pm2 web
        ;;
    9)
        echo -e "${RED}🗑️  서비스 삭제${NC}"
        pm2 delete all
        ;;
    10)
        echo -e "${BLUE}🔧 모든 서비스 관리${NC}"
        echo -e "1. 프로덕션 서비스만 관리"
        echo -e "2. 개발 서비스만 관리"
        echo -e "3. 모든 서비스 관리"
        read -p "선택하세요 (1-3): " service_choice
        case $service_choice in
            1)
                pm2 restart all4fit-main
                pm2 logs all4fit-main
                ;;
            2)
                pm2 restart all4fit-dev
                pm2 logs all4fit-dev
                ;;
            3)
                pm2 restart all
                pm2 logs
                ;;
        esac
        ;;
    *)
        echo -e "${RED}❌ 잘못된 선택입니다.${NC}"
        ;;
esac
