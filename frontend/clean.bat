@echo off
setlocal enabledelayedexpansion

echo Fetching latest changes from origin...
git fetch --all --prune

echo Deleting local branches that don't exist on remote...
for /f "tokens=*" %%a in ('git branch -vv ^| findstr /c:"gone]"') do (
    set "branch=%%a"
    set "branch=!branch:*[ =!"
    set "branch=!branch:~0,-1!"
    echo Deleting branch !branch!...
    git branch -D !branch!
)

echo Switching to develop branch...
git checkout develop

echo Fetching again to ensure we're up to date...
git fetch --all

echo Script completed successfully!