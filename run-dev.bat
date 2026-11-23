@echo off
echo ========================================================
echo Starting Inventory Management System (Dev Profile)
echo Zero-config standalone in-memory database with seeded data
echo ========================================================
set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.15.6-hotspot
cd /d "%~dp0"
"d:\NewProject\tools\apache-maven-3.9.9\bin\mvn.cmd" -s "d:\NewProject\tools\settings.xml" spring-boot:run -Dspring-boot.run.profiles=dev
pause
