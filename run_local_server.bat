@echo off
echo 모두의핏 로컬 개발 서버를 시작합니다...
echo.
echo 브라우저에서 http://localhost:8000 으로 접속하세요
echo.
echo 서버를 종료하려면 Ctrl+C를 누르세요
echo.
python -m http.server 8000
pause
