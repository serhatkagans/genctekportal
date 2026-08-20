@echo off
chcp 65001 >nul
title GencTek Portal baslatici
REM Mantik dagitim\yerel-baslat.ps1 icinde; bu dosya yalnizca sarmalayici.
REM Sabit yol degil %~dp0 kullanilir: ust klasor adinda bosluk var.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0dagitim\yerel-baslat.ps1"
pause
