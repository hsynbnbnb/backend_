@echo off
REM ============================================================
REM  pilipili-backend local launcher (Windows)
REM  Start this BEFORE "npm run serve" in UI-/client.
REM  Keep this window open; closing it stops the backend.
REM  Prereq: MySQL 3306 running with an empty/existing "pilipili" database.
REM          First time on a fresh machine, run once in any MySQL client:
REM          CREATE DATABASE IF NOT EXISTS pilipili DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
REM ============================================================

cd /d "%~dp0"

if not exist "target\pilipili-backend-1.0.0.jar" (
  echo [ERROR] jar not found. Build it first:
  echo         mvn -DskipTests clean package
  echo         or ask the backend team for the prebuilt jar.
  pause
  exit /b 1
)

REM Resolve java: prefer PATH, fall back to the bundled JBR on this machine.
set "JAVA_EXE=java"
where java >nul 2>nul
if errorlevel 1 set "JAVA_EXE=D:\datagrip\DataGrip 2022.3.3\jbr\bin\java.exe"

if not exist "%JAVA_EXE%" (
  if "%JAVA_EXE%" neq "java" (
    echo [ERROR] java.exe not found at: %JAVA_EXE%
    echo         Install JDK 17 or edit JAVA_EXE in this script.
    pause
    exit /b 1
  )
)

REM Password stays in this process only; never written to disk.
if not defined PILIPILI_DB_PASSWORD (
  set /p PILIPILI_DB_PASSWORD=Enter MySQL password for pilipili: 
)

echo Starting pilipili-backend on http://localhost:9090 ...
echo Health check: http://localhost:9090/api/health
echo.

REM --server.port is explicit: some shells inject SERVER__PORT and override yml.
"%JAVA_EXE%" -jar "target\pilipili-backend-1.0.0.jar" --server.port=9090

echo.
echo Backend stopped.
pause
