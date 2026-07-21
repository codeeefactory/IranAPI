@echo off
cd /d "%~dp0"
set "XELATEX=xelatex"
where xelatex >nul 2>nul
if errorlevel 1 (
  if exist "%LOCALAPPDATA%\Programs\MiKTeX\miktex\bin\x64\xelatex.exe" (
    set "XELATEX=%LOCALAPPDATA%\Programs\MiKTeX\miktex\bin\x64\xelatex.exe"
  )
)
"%XELATEX%" -interaction=nonstopmode -halt-on-error main.tex
if errorlevel 1 goto error
"%XELATEX%" -interaction=nonstopmode -halt-on-error main.tex
if errorlevel 1 goto error
"%XELATEX%" -interaction=nonstopmode -halt-on-error main.tex
if errorlevel 1 goto error
echo.
echo Build completed: main.pdf
pause
exit /b 0
:error
echo.
echo Build failed. Check main.log.
pause
exit /b 1
