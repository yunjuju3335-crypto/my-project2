@echo off
chcp 65001 > nul
echo ========================================================
echo  백재상례복 - GitHub Pages 실시간 배포 동기화
echo ========================================================
echo.
cd /d "C:\Users\권윤주\Desktop\homepage"

set GIT_EXE="C:\Users\권윤주\AppData\Local\GitHubDesktop\app-3.6.7\resources\app\git\cmd\git.exe"

echo [1/3] 변경사항 확인 및 스테이징 중...
%GIT_EXE% add -A

echo [2/3] 자동 커밋 생성 중...
%GIT_EXE% commit -m "update: admin updated content and prices"

echo [3/3] GitHub Pages(origin/main)로 푸시 중...
%GIT_EXE% push origin main

echo.
echo ========================================================
echo  [완료] 배포 완료! 30초 내에 아래 사이트에 실시간 반영됩니다:
echo    https://yunjuju3335-crypto.github.io/my-project2/
echo ========================================================
echo.
pause
