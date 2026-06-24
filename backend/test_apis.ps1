$ErrorActionPreference = 'Continue'

Write-Host "===== TEST 1: POST /api/v1/auth/login =====" -ForegroundColor Cyan

# ---- 1a: Missing credentials ----
Write-Host ""
Write-Host "[1a] Missing credentials - empty body (expect 400/validation error):" -ForegroundColor Yellow
try {
    $r = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/auth/login" `
        -Method POST -ContentType "application/json" -Body "{}" -ErrorAction Stop
    Write-Host ("HTTP 2xx -> " + ($r | ConvertTo-Json -Compress)) -ForegroundColor Green
} catch {
    $code = $_.Exception.Response.StatusCode.value__
    $msg  = $_.ErrorDetails.Message
    Write-Host ("HTTP $code -> $msg") -ForegroundColor Red
}

# ---- 1b: Wrong credentials ----
Write-Host ""
Write-Host "[1b] Wrong credentials (expect 401):" -ForegroundColor Yellow
$wrongBody = @{ email = "notexist@test.com"; password = "wrongpass" } | ConvertTo-Json
try {
    $r = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/auth/login" `
        -Method POST -ContentType "application/json" -Body $wrongBody -ErrorAction Stop
    Write-Host ("HTTP 2xx -> " + ($r | ConvertTo-Json -Compress)) -ForegroundColor Green
} catch {
    $code = $_.Exception.Response.StatusCode.value__
    $msg  = $_.ErrorDetails.Message
    Write-Host ("HTTP $code -> $msg") -ForegroundColor Red
}

# ---- 1c: Admin login ----
Write-Host ""
Write-Host "[1c] Admin login  admin.amit@lms.com / Admin@123 (expect 200 + token):" -ForegroundColor Yellow
$adminBody = @{ email = "admin.amit@lms.com"; password = "Admin@123" } | ConvertTo-Json
$adminToken = $null
try {
    $r = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/auth/login" `
        -Method POST -ContentType "application/json" -Body $adminBody -ErrorAction Stop
    $adminToken = $r.token
    $tokenPreview = $adminToken.Substring(0, [Math]::Min(60, $adminToken.Length))
    Write-Host "HTTP 200 - Login SUCCESS" -ForegroundColor Green
    Write-Host ("Token (first 60 chars): $tokenPreview...")
    Write-Host ("User: " + ($r.user | ConvertTo-Json -Compress))
} catch {
    $code = $_.Exception.Response.StatusCode.value__
    $msg  = $_.ErrorDetails.Message
    Write-Host ("HTTP $code -> $msg") -ForegroundColor Red
}

Write-Host ""
Write-Host "===== TEST 2: GET /api/v1/admin/health =====" -ForegroundColor Cyan

# ---- 2a: No auth token ----
Write-Host ""
Write-Host "[2a] No auth token (expect 401):" -ForegroundColor Yellow
try {
    $r = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/admin/health" `
        -Method GET -ErrorAction Stop
    Write-Host ("HTTP 2xx -> " + ($r | ConvertTo-Json -Compress)) -ForegroundColor Green
} catch {
    $code = $_.Exception.Response.StatusCode.value__
    $msg  = $_.ErrorDetails.Message
    Write-Host ("HTTP $code -> $msg") -ForegroundColor Red
}

# ---- 2b: With valid admin token ----
Write-Host ""
Write-Host "[2b] With admin Bearer token (expect 200 if DB+Redis OK, 503 if degraded):" -ForegroundColor Yellow
if ($null -eq $adminToken) {
    Write-Host "SKIPPED - no admin token obtained from login" -ForegroundColor DarkYellow
} else {
    $headers = @{ Authorization = "Bearer $adminToken" }
    try {
        $r = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/admin/health" `
            -Method GET -Headers $headers -ErrorAction Stop
        Write-Host "HTTP 200 - Health check PASSED" -ForegroundColor Green
        Write-Host ($r | ConvertTo-Json -Depth 5)
    } catch {
        $code = $_.Exception.Response.StatusCode.value__
        $msg  = $_.ErrorDetails.Message
        Write-Host ("HTTP $code -> $msg") -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "===== ALL TESTS COMPLETE =====" -ForegroundColor Cyan
