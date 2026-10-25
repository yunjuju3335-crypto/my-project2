@echo off
setlocal
cd /d "%~dp0"
if not exist "index.html" cd /d "%USERPROFILE%\Desktop\homepage"

set "GIT_EXE=%LOCALAPPDATA%\GitHubDesktop\app-3.6.7\resources\app\git\cmd\git.exe"
if not exist "%GIT_EXE%" set "GIT_EXE=%LOCALAPPDATA%\GitHubDesktop\app-3.6.6\resources\app\git\cmd\git.exe"

echo [1/3] Staging changes...
"%GIT_EXE%" add -A

echo [2/3] Committing changes...
"%GIT_EXE%" commit -m "update: sync changes to github pages"

echo [3/3] Pushing to GitHub Pages...
"%GIT_EXE%" push origin main

echo.
echo ========================================================
echo  [DONE] Deployment complete! Live in 30s at:
echo    https://yunjuju3335-crypto.github.io/my-project2/
echo ========================================================
echo.
pause
