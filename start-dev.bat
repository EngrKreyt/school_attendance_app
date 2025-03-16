@echo off
echo Starting School Attendance App for network access...

echo Your IP address information:
ipconfig | findstr "IPv4"

echo.
echo Starting server...
cd server
start cmd /k "npm run dev"

echo.
echo Starting client...
cd ../client
start cmd /k "npm run dev"

echo.
echo ======================================================
echo To access the app from your mobile device:
echo 1. Make sure your mobile device is on the same WiFi network
echo 2. On your mobile device, open a browser and go to:
echo    http://YOUR_IP_ADDRESS:5173
echo    (Replace YOUR_IP_ADDRESS with your computer's IPv4 address shown above)
echo ======================================================
echo. 