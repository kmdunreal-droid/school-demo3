@echo off
chcp 65001 >nul
set GIT_DIR=D:\app\school-demo2\.git
set GIT_WORK_TREE=D:\app\school-demo2
d:\app\school-demo2\.git\cmd\git.exe %*
