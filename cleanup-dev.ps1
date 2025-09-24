#!/usr/bin/env pwsh
# cleanup-dev.ps1 - Clean up development processes and start server

Write-Host "🧹 Cleaning up existing Node.js processes..." -ForegroundColor Yellow

# Kill Node.js processes
try {
    $processes = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if ($processes) {
        $processes | Stop-Process -Force
        Write-Host "✅ Killed $($processes.Count) Node.js process(es)" -ForegroundColor Green
    } else {
        Write-Host "ℹ️ No Node.js processes found" -ForegroundColor Blue
    }
} catch {
    Write-Host "⚠️ Error cleaning processes: $($_.Exception.Message)" -ForegroundColor Red
}

# Check if port 3000 is still in use
Write-Host "🔍 Checking port 3000..." -ForegroundColor Yellow
$portCheck = netstat -ano | findstr ":3000"
if ($portCheck) {
    Write-Host "⚠️ Port 3000 still in use:" -ForegroundColor Red
    Write-Host $portCheck
    
    # Extract PIDs and kill them
    $pids = $portCheck | ForEach-Object { 
        if ($_ -match "\s+(\d+)$") { 
            $matches[1] 
        } 
    } | Sort-Object -Unique
    
    foreach ($pid in $pids) {
        try {
            taskkill /f /pid $pid 2>$null
            Write-Host "✅ Killed process $pid" -ForegroundColor Green
        } catch {
            Write-Host "⚠️ Could not kill process $pid" -ForegroundColor Red
        }
    }
} else {
    Write-Host "✅ Port 3000 is free" -ForegroundColor Green
}

Write-Host "🚀 Starting development server..." -ForegroundColor Green
npm run dev