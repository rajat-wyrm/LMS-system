$ErrorActionPreference = 'Continue'

Write-Host "===== Verifying Admin Stats Metrics =====" -ForegroundColor Cyan

# Step 1: Login to get token
$loginBody = @{ email = "admin.amit@lms.com"; password = "Admin@123" } | ConvertTo-Json
$adminToken = $null

try {
    $loginRes = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/auth/login" `
        -Method POST -ContentType "application/json" -Body $loginBody -ErrorAction Stop
    $adminToken = $loginRes.token
    Write-Host "[LOGIN] SUCCESS - Got admin token" -ForegroundColor Green
} catch {
    Write-Host ("[LOGIN] FAILED - " + $_.ErrorDetails.Message) -ForegroundColor Red
    exit
}

$headers = @{ Authorization = "Bearer $adminToken" }

# Step 2: Hit /api/v1/admin/stats
Write-Host ""
Write-Host "Calling GET /api/v1/admin/stats ..." -ForegroundColor Yellow
try {
    $r = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/admin/stats" `
        -Method GET -Headers $headers -ErrorAction Stop
    $d = $r.data

    Write-Host ""
    Write-Host "--- Metric Checklist ---" -ForegroundColor Cyan

    # 1. Weekly Enrollments
    if ($null -ne $d.weeklyEnrollments) {
        Write-Host ("[PASS] weeklyEnrollments     = " + $d.weeklyEnrollments) -ForegroundColor Green
    } else {
        Write-Host "[FAIL] weeklyEnrollments     = MISSING" -ForegroundColor Red
    }

    # 2. Completion Rate
    if ($null -ne $d.completionRate) {
        Write-Host ("[PASS] completionRate        = " + $d.completionRate + "%") -ForegroundColor Green
    } else {
        Write-Host "[FAIL] completionRate        = MISSING" -ForegroundColor Red
    }

    # 3. Monthly Revenue
    if ($null -ne $d.monthlyRevenue -and $d.monthlyRevenue.Count -gt 0) {
        Write-Host ("[PASS] monthlyRevenue        = " + $d.monthlyRevenue.Count + " months of data") -ForegroundColor Green
        foreach ($m in $d.monthlyRevenue) {
            Write-Host ("         -> " + $m.month + ": Rs." + $m.revenue) -ForegroundColor DarkGreen
        }
    } else {
        Write-Host "[FAIL] monthlyRevenue        = MISSING or EMPTY" -ForegroundColor Red
    }

    # 4. Student Growth
    if ($null -ne $d.studentGrowth -and $d.studentGrowth.Count -gt 0) {
        Write-Host ("[PASS] studentGrowth         = " + $d.studentGrowth.Count + " months of data") -ForegroundColor Green
        foreach ($m in $d.studentGrowth) {
            Write-Host ("         -> " + $m.month + ": " + $m.students + " new students") -ForegroundColor DarkGreen
        }
    } else {
        Write-Host "[FAIL] studentGrowth         = MISSING or EMPTY" -ForegroundColor Red
    }

    # 5. Total Revenue
    if ($null -ne $d.totalRevenue) {
        Write-Host ("[PASS] totalRevenue (allTime)= Rs." + $d.totalRevenue) -ForegroundColor Green
    } else {
        Write-Host "[FAIL] totalRevenue          = MISSING" -ForegroundColor Red
    }

    # Bonus: basic counts
    Write-Host ""
    Write-Host "--- Basic Counts (bonus) ---" -ForegroundColor Cyan
    Write-Host ("  totalUsers        = " + $d.totalUsers)
    Write-Host ("  totalStudents     = " + $d.totalStudents)
    Write-Host ("  totalInstructors  = " + $d.totalInstructors)
    Write-Host ("  totalCourses      = " + $d.totalCourses)
    Write-Host ("  totalEnrollments  = " + $d.totalEnrollments)
    Write-Host ("  activeEnrollments = " + $d.activeEnrollments)
    Write-Host ("  completedEnroll.  = " + $d.completedEnrollments)
    Write-Host ("  pendingUsers      = " + $d.pendingUsers)
    Write-Host ("  pendingCourses    = " + $d.pendingCourses)

} catch {
    $code = $_.Exception.Response.StatusCode.value__
    $msg  = $_.ErrorDetails.Message
    Write-Host ("HTTP $code -> $msg") -ForegroundColor Red
}

# Step 3: Hit /api/v1/admin/health
Write-Host ""
Write-Host "Calling GET /api/v1/admin/health ..." -ForegroundColor Yellow
try {
    $h = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/admin/health" `
        -Method GET -Headers $headers -ErrorAction Stop
    $hd = $h.data
    if ($hd.db -eq "ok") {
        Write-Host ("[PASS] System Health DB      = " + $hd.db) -ForegroundColor Green
    } else {
        Write-Host ("[FAIL] System Health DB      = " + $hd.db) -ForegroundColor Red
    }
    if ($hd.redis -eq "ok") {
        Write-Host ("[PASS] System Health Redis   = " + $hd.redis) -ForegroundColor Green
    } else {
        Write-Host ("[FAIL] System Health Redis   = " + $hd.redis) -ForegroundColor Red
    }
    Write-Host ("[PASS] Overall status        = " + $hd.status) -ForegroundColor Green
} catch {
    $code = $_.Exception.Response.StatusCode.value__
    $msg  = $_.ErrorDetails.Message
    Write-Host ("HTTP $code -> $msg") -ForegroundColor Red
}

Write-Host ""
Write-Host "===== VERIFICATION COMPLETE =====" -ForegroundColor Cyan
