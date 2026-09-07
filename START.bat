@echo off
chcp 65001 >nul
cd /d "%~dp0"
title e-Return Demo

echo.
echo   ==========================================
echo    e-Return Demo - অনুশীলন ও কর পরামর্শ
echo   ==========================================
echo.

where node >nul 2>nul
if %errorlevel%==0 (
    echo   Node পাওয়া গেছে - সার্ভার চালু হচ্ছে...
    echo   ব্রাউজারে খুলুন:  http://localhost:5173
    echo   বন্ধ করতে এই জানালায় Ctrl+C চাপুন।
    echo.
    start "" http://localhost:5173
    node server.js
) else (
    echo   Node ইনস্টল করা নেই - সরাসরি ফাইল খুলছি।
    echo   [নোট] এভাবে খুললে Ask AI-এর অনলাইন উত্তর কাজ নাও করতে পারে,
    echo         তবে অফলাইন উত্তর ও বাকি সবকিছু ঠিকঠাক চলবে।
    echo.
    echo   অনলাইন AI চাইলে Node ইনস্টল করুন:  https://nodejs.org
    echo.
    start "" "%~dp0index.html"
    pause
)
