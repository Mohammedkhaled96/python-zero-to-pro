@echo off
REM ===========================================================
REM  Python Course - local server (double-click this file)
REM  Keep this window open while you study. Ctrl+C to stop.
REM ===========================================================
cd /d "%~dp0"
set PORT=8000

where python >nul 2>nul
if errorlevel 1 goto nopython

echo.
echo   Course URL:  http://localhost:%PORT%
echo   Keep this window open. Press Ctrl+C to stop the server.
echo.
start "" http://localhost:%PORT%
python -m http.server %PORT%
goto end

:nopython
echo.
echo   [X] Python was not found on this PC.
echo       1) Install it from https://www.python.org/downloads/  then run this file again.
echo       2) OR just open the no-server version:  dist\python-course.html
echo.
pause

:end
