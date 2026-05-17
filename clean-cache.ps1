# Script สำหรับลบ cache และ build artifacts
# Usage: powershell -ExecutionPolicy Bypass -File clean-cache.ps1

Write-Host "=== Cleaning Project Cache ===" -ForegroundColor Cyan
Write-Host ""

# 1. ลบ Angular cache
if (Test-Path '.angular') {
    $size = (Get-ChildItem '.angular' -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
    Write-Host "Removing .angular cache ($([math]::Round($size/1MB, 2)) MB)..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force '.angular' -ErrorAction SilentlyContinue
    Write-Host "✓ Angular cache cleaned!" -ForegroundColor Green
} else {
    Write-Host "No .angular folder found" -ForegroundColor Gray
}

# 2. ลบ dist folder (build artifacts)
if (Test-Path 'dist') {
    $size = (Get-ChildItem 'dist' -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
    Write-Host "Removing dist folder ($([math]::Round($size/1MB, 2)) MB)..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force 'dist' -ErrorAction SilentlyContinue
    Write-Host "✓ Dist folder cleaned!" -ForegroundColor Green
} else {
    Write-Host "No dist folder found" -ForegroundColor Gray
}

# 3. ลบ log files
$logFiles = Get-ChildItem -Recurse -File -Filter "*.log" -ErrorAction SilentlyContinue
if ($logFiles) {
    Write-Host "Removing log files ($($logFiles.Count) files)..." -ForegroundColor Yellow
    $logFiles | Remove-Item -Force -ErrorAction SilentlyContinue
    Write-Host "✓ Log files cleaned!" -ForegroundColor Green
} else {
    Write-Host "No log files found" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=== Cleanup Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "To prevent cache from growing too large:" -ForegroundColor Cyan
Write-Host "1. Run this script regularly: powershell -ExecutionPolicy Bypass -File clean-cache.ps1"
Write-Host "2. Or use: ng cache clean"
Write-Host "3. Add cache folders to .gitignore (already done)"

