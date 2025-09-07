#!/bin/bash

# 모두의핏 웹사이트 모니터링 스크립트

# 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🔍 시스템 상태를 확인합니다...${NC}"

# 1. Nginx 상태 확인
echo -e "\n${YELLOW}📊 Nginx 상태:${NC}"
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ Nginx 실행 중${NC}"
else
    echo -e "${RED}❌ Nginx 중지됨${NC}"
fi

# 2. 디스크 사용량 확인
echo -e "\n${YELLOW}💾 디스크 사용량:${NC}"
df -h /var/www/all4fit

# 3. 메모리 사용량 확인
echo -e "\n${YELLOW}🧠 메모리 사용량:${NC}"
free -h

# 4. CPU 사용량 확인
echo -e "\n${YELLOW}⚡ CPU 사용량:${NC}"
top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print "CPU 사용률: " $1 "%"}'

# 5. 웹사이트 응답 확인
echo -e "\n${YELLOW}🌐 웹사이트 응답 확인:${NC}"
if curl -f http://localhost > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 웹사이트 정상 응답${NC}"
else
    echo -e "${RED}❌ 웹사이트 응답 없음${NC}"
fi

# 6. 최근 에러 로그 확인
echo -e "\n${YELLOW}📋 최근 에러 로그 (마지막 10줄):${NC}"
sudo tail -10 /var/log/nginx/error.log 2>/dev/null || echo "에러 로그 없음"

# 7. 접속 통계
echo -e "\n${YELLOW}📈 최근 접속 통계:${NC}"
sudo tail -5 /var/log/nginx/access.log 2>/dev/null || echo "접속 로그 없음"

echo -e "\n${GREEN}✅ 모니터링 완료${NC}"
