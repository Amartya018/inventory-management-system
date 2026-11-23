@echo off
echo ========================================================
echo Starting Inventory Management System (MySQL 8)
echo Ensure MySQL is running on port 3306 and password is set in application.properties
echo ========================================================
set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.15.6-hotspot
cd /d "%~dp0"
"d:\NewProject\tools\apache-maven-3.9.9\bin\mvn.cmd" -s "d:\NewProject\tools\settings.xml" spring-boot:run
pause
