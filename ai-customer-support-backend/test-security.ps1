# ============================================================
# AI Customer Support Backend
# Full Security & API Regression Test
# ============================================================

$BaseUrl = "http://localhost:8080"

$Passed = 0
$Failed = 0
$Results = @()

# ------------------------------------------------------------
# Helper: Test HTTP endpoint
# ------------------------------------------------------------

function Test-Api {
    param(
        [string]$Name,
        [string]$Method = "GET",
        [string]$Url,
        [hashtable]$Headers = @{},
        [string]$Body = $null,
        [int[]]$ExpectedStatus
    )

    try {
        $params = @{
            Uri         = $Url
            Method      = $Method
            Headers     = $Headers
            ErrorAction = "Stop"
        }

        if ($Body) {
            $params["ContentType"] = "application/json"
            $params["Body"] = $Body
        }

        $response = Invoke-WebRequest @params -UseBasicParsing

        $status = [int]$response.StatusCode
        $responseBody = $response.Content

        if ($ExpectedStatus -contains $status) {
            Write-Host "[PASS] $Name -> $status" -ForegroundColor Green
            $script:Passed++

            $script:Results += [PSCustomObject]@{
                Test   = $Name
                Status = $status
                Result = "PASS"
            }
        }
        else {
            Write-Host "[FAIL] $Name -> Expected $($ExpectedStatus -join ', ') but got $status" -ForegroundColor Red
            Write-Host "       Response: $responseBody" -ForegroundColor DarkRed

            $script:Failed++

            $script:Results += [PSCustomObject]@{
                Test   = $Name
                Status = $status
                Result = "FAIL"
            }
        }

        return @{
            Status = $status
            Body   = $responseBody
        }
    }
    catch {
        $status = 0
        $responseBody = ""

        if ($_.Exception.Response) {
            try {
                $status = [int]$_.Exception.Response.StatusCode.value__

                $stream = $_.Exception.Response.GetResponseStream()

                if ($stream) {
                    $reader = New-Object System.IO.StreamReader($stream)
                    $responseBody = $reader.ReadToEnd()
                    $reader.Close()
                }
            }
            catch {
                $status = 0
            }
        }

        if ($ExpectedStatus -contains $status) {
            Write-Host "[PASS] $Name -> $status" -ForegroundColor Green
            $script:Passed++

            $script:Results += [PSCustomObject]@{
                Test   = $Name
                Status = $status
                Result = "PASS"
            }
        }
        else {
            Write-Host "[FAIL] $Name -> Expected $($ExpectedStatus -join ', ') but got $status" -ForegroundColor Red

            if ($responseBody) {
                Write-Host "       Response: $responseBody" -ForegroundColor DarkRed
            }
            else {
                Write-Host "       Error: $($_.Exception.Message)" -ForegroundColor DarkRed
            }

            $script:Failed++

            $script:Results += [PSCustomObject]@{
                Test   = $Name
                Status = $status
                Result = "FAIL"
            }
        }

        return @{
            Status = $status
            Body   = $responseBody
        }
    }
}

# ------------------------------------------------------------
# Helper: Login
# ------------------------------------------------------------

function Login-User {
    param(
        [string]$Email,
        [string]$Password
    )

    $body = @{
        email    = $Email
        password = $Password
    } | ConvertTo-Json

    try {
        $response = Invoke-WebRequest `
            -Uri "$BaseUrl/auth/login" `
            -Method POST `
            -ContentType "application/json" `
            -Body $body `
            -UseBasicParsing `
            -ErrorAction Stop

        return $response.Content | ConvertFrom-Json
    }
    catch {
        Write-Host "Login failed for $Email" -ForegroundColor Red
        return $null
    }
}

# ------------------------------------------------------------
# Header helper
# ------------------------------------------------------------

function Get-AuthHeaders {
    param(
        [string]$Token
    )

    return @{
        Authorization = "Bearer $Token"
    }
}

# ============================================================
# START
# ============================================================

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " AI CUSTOMER SUPPORT BACKEND" -ForegroundColor Cyan
Write-Host " FULL SECURITY & API TEST" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# ============================================================
# 1. HEALTH CHECK
# ============================================================

Write-Host "1. HEALTH CHECK" -ForegroundColor Yellow

Test-Api `
    -Name "Backend health" `
    -Url "$BaseUrl/health" `
    -ExpectedStatus @(200)

Write-Host ""

# ============================================================
# 2. PROTECTED ENDPOINT WITHOUT TOKEN
# ============================================================

Write-Host "2. JWT PROTECTION" -ForegroundColor Yellow

Test-Api `
    -Name "Protected endpoint without JWT" `
    -Url "$BaseUrl/customers" `
    -ExpectedStatus @(401)

Write-Host ""

# ============================================================
# 3. ADMIN LOGIN
# ============================================================

Write-Host "3. ADMIN AUTHENTICATION" -ForegroundColor Yellow

$admin = Login-User `
    -Email "admin@aicustomersupport.com" `
    -Password "Admin@123456"

if ($admin) {

    Write-Host "[PASS] Admin login -> 200" -ForegroundColor Green
    $Passed++

    $Results += [PSCustomObject]@{
        Test   = "Admin login"
        Status = 200
        Result = "PASS"
    }

    $adminToken = $admin.token
    $adminHeaders = Get-AuthHeaders $adminToken

    Write-Host "       Admin ID   : $($admin.userId)"
    Write-Host "       Admin Email: $($admin.email)"
    Write-Host "       Admin Role : $($admin.role)"
}
else {

    Write-Host "[FAIL] Admin login" -ForegroundColor Red
    $Failed++

    $Results += [PSCustomObject]@{
        Test   = "Admin login"
        Status = 0
        Result = "FAIL"
    }

    Write-Host ""
    Write-Host "Cannot continue without Admin authentication." -ForegroundColor Red
    exit
}

Write-Host ""

# ============================================================
# 4. ADMIN ENDPOINTS
# ============================================================

Write-Host "4. ADMIN AUTHORIZATION" -ForegroundColor Yellow

Test-Api `
    -Name "Admin -> Customers" `
    -Url "$BaseUrl/customers" `
    -Headers $adminHeaders `
    -ExpectedStatus @(200)

Test-Api `
    -Name "Admin -> Employees" `
    -Url "$BaseUrl/employees" `
    -Headers $adminHeaders `
    -ExpectedStatus @(200)

Test-Api `
    -Name "Admin -> Tickets" `
    -Url "$BaseUrl/tickets" `
    -Headers $adminHeaders `
    -ExpectedStatus @(200)

Test-Api `
    -Name "Admin -> Messages" `
    -Url "$BaseUrl/messages" `
    -Headers $adminHeaders `
    -ExpectedStatus @(200)

Test-Api `
    -Name "Admin -> Categories" `
    -Url "$BaseUrl/categories" `
    -Headers $adminHeaders `
    -ExpectedStatus @(200)

Test-Api `
    -Name "Admin -> Incidents" `
    -Url "$BaseUrl/incidents" `
    -Headers $adminHeaders `
    -ExpectedStatus @(200)

Write-Host ""

# ============================================================
# 5. CUSTOMER REGISTRATION
# ============================================================

Write-Host "5. CUSTOMER REGISTRATION" -ForegroundColor Yellow

$timestamp = Get-Date -Format "yyyyMMddHHmmss"

$customerEmail = "security.test.$timestamp@gmail.com"
$customerPassword = "Customer@123456"

$customerBody = @{
    name        = "Security Test Customer"
    email       = $customerEmail
    password    = $customerPassword
    age         = 22
    gender      = "Male"
    phoneNumber = "01000000000"
    address     = "Cairo, Egypt"
} | ConvertTo-Json

$customerRegister = Test-Api `
    -Name "Customer registration" `
    -Method "POST" `
    -Url "$BaseUrl/auth/register" `
    -Body $customerBody `
    -ExpectedStatus @(200, 201)

Write-Host ""

# ============================================================
# 6. CUSTOMER LOGIN
# ============================================================

Write-Host "6. CUSTOMER AUTHENTICATION" -ForegroundColor Yellow

$customer = Login-User `
    -Email $customerEmail `
    -Password $customerPassword

if ($customer) {

    Write-Host "[PASS] Customer login -> 200" -ForegroundColor Green
    $Passed++

    $Results += [PSCustomObject]@{
        Test   = "Customer login"
        Status = 200
        Result = "PASS"
    }

    $customerToken = $customer.token
    $customerHeaders = Get-AuthHeaders $customerToken
    $customerId = $customer.userId

    Write-Host "       Customer ID   : $customerId"
    Write-Host "       Customer Email: $($customer.email)"
    Write-Host "       Customer Role : $($customer.role)"
}
else {

    Write-Host "[FAIL] Customer login" -ForegroundColor Red
    $Failed++

    Write-Host ""
    Write-Host "Customer tests cannot continue." -ForegroundColor Red
    exit
}

Write-Host ""

# ============================================================
# 7. CUSTOMER OWN RESOURCES
# ============================================================

Write-Host "7. CUSTOMER OWN RESOURCES" -ForegroundColor Yellow

Test-Api `
    -Name "Customer -> Own Profile" `
    -Url "$BaseUrl/customers/$customerId" `
    -Headers $customerHeaders `
    -ExpectedStatus @(200)

Test-Api `
    -Name "Customer -> Own Tickets" `
    -Url "$BaseUrl/tickets/customer/$customerId" `
    -Headers $customerHeaders `
    -ExpectedStatus @(200)

Write-Host ""

# ============================================================
# 8. CUSTOMER FORBIDDEN RESOURCES
# ============================================================

Write-Host "8. CUSTOMER FORBIDDEN ACCESS" -ForegroundColor Yellow

Test-Api `
    -Name "Customer -> Employees must be forbidden" `
    -Url "$BaseUrl/employees" `
    -Headers $customerHeaders `
    -ExpectedStatus @(403)

Test-Api `
    -Name "Customer -> Customers must be forbidden" `
    -Url "$BaseUrl/customers" `
    -Headers $customerHeaders `
    -ExpectedStatus @(403)

Test-Api `
    -Name "Customer -> Admin message endpoint must be forbidden" `
    -Method "POST" `
    -Url "$BaseUrl/messages/customer/$customerId" `
    -Headers $customerHeaders `
    -Body (@{
        txt = "Unauthorized admin-style message test"
    } | ConvertTo-Json) `
    -ExpectedStatus @(403)

Write-Host ""

# ============================================================
# 9. CUSTOMER CREATE TICKET
# ============================================================

Write-Host "9. CUSTOMER TICKET CREATION" -ForegroundColor Yellow

$ticketBody = @{
    title       = "Unable to access my account"
    description = "I cannot log in to my customer account."
    status      = "OPEN"
    priority    = "HIGH"
} | ConvertTo-Json

$ticketResponse = Test-Api `
    -Name "Customer -> Create Ticket" `
    -Method "POST" `
    -Url "$BaseUrl/tickets" `
    -Headers $customerHeaders `
    -Body $ticketBody `
    -ExpectedStatus @(200, 201)

$ticketId = $null

if ($ticketResponse.Body) {

    try {
        $ticketObject = $ticketResponse.Body | ConvertFrom-Json
        $ticketId = $ticketObject.id

        Write-Host "       Created Ticket ID: $ticketId" -ForegroundColor Cyan
    }
    catch {
        Write-Host "       Could not extract ticket ID." -ForegroundColor Yellow
    }
}

Write-Host ""

# ============================================================
# 10. CUSTOMER TICKET OWNERSHIP
# ============================================================

if ($ticketId) {

    Write-Host "10. CUSTOMER TICKET OWNERSHIP" -ForegroundColor Yellow

    Test-Api `
        -Name "Customer -> Own Ticket" `
        -Url "$BaseUrl/tickets/$ticketId" `
        -Headers $customerHeaders `
        -ExpectedStatus @(200)

    Write-Host ""

    # ========================================================
    # 11. AI ANALYSIS
    # ========================================================

    Write-Host "11. AI TICKET ANALYSIS" -ForegroundColor Yellow

    Test-Api `
        -Name "Customer -> AI Analysis must be forbidden" `
        -Url "$BaseUrl/tickets/$ticketId/analyze" `
        -Headers $customerHeaders `
        -ExpectedStatus @(403)

    Test-Api `
        -Name "Admin -> AI Analysis" `
        -Url "$BaseUrl/tickets/$ticketId/analyze" `
        -Headers $adminHeaders `
        -ExpectedStatus @(200)

    Write-Host ""
}
else {

    Write-Host "[SKIP] Ticket ownership tests because ticket creation failed." -ForegroundColor Yellow
    Write-Host ""
}

# ============================================================
# 12. CUSTOMER MESSAGE
# ============================================================

Write-Host "12. CUSTOMER MESSAGES" -ForegroundColor Yellow

$messageBody = @{
    txt = "This is a security test customer message."
} | ConvertTo-Json

$messageResponse = Test-Api `
    -Name "Customer -> Create Message" `
    -Method "POST" `
    -Url "$BaseUrl/messages" `
    -Headers $customerHeaders `
    -Body $messageBody `
    -ExpectedStatus @(200, 201)

$messageId = $null

if ($messageResponse.Body) {

    try {
        $messageObject = $messageResponse.Body | ConvertFrom-Json
        $messageId = $messageObject.id

        Write-Host "       Created Message ID: $messageId" -ForegroundColor Cyan
    }
    catch {
        Write-Host "       Could not extract message ID." -ForegroundColor Yellow
    }
}

if ($messageId) {

    Test-Api `
        -Name "Customer -> Own Message" `
        -Url "$BaseUrl/messages/$messageId" `
        -Headers $customerHeaders `
        -ExpectedStatus @(200)
}

Write-Host ""

# ============================================================
# 13. DUPLICATE EMAIL
# ============================================================

Write-Host "13. DUPLICATE EMAIL PROTECTION" -ForegroundColor Yellow

Test-Api `
    -Name "Duplicate customer email must be rejected" `
    -Method "POST" `
    -Url "$BaseUrl/auth/register" `
    -Body $customerBody `
    -ExpectedStatus @(400, 409)

Write-Host ""

# ============================================================
# 14. ADMIN CREATE EMPLOYEE
# ============================================================

Write-Host "14. EMPLOYEE CREATION" -ForegroundColor Yellow

$employeeEmail = "security.employee.$timestamp@gmail.com"

$employeeBody = @{
    name     = "Security Test Employee"
    email    = $employeeEmail
    password = "Employee@123456"
    role     = "EMPLOYEE"
    age      = 25
    gender   = "Male"
    salary   = 5000
} | ConvertTo-Json

$employeeResponse = Test-Api `
    -Name "Admin -> Create Employee" `
    -Method "POST" `
    -Url "$BaseUrl/employees" `
    -Headers $adminHeaders `
    -Body $employeeBody `
    -ExpectedStatus @(200, 201)

Write-Host ""

# ============================================================
# 15. EMPLOYEE LOGIN
# ============================================================

Write-Host "15. EMPLOYEE AUTHENTICATION" -ForegroundColor Yellow

$employee = Login-User `
    -Email $employeeEmail `
    -Password "Employee@123456"

if ($employee) {

    Write-Host "[PASS] Employee login -> 200" -ForegroundColor Green
    $Passed++

    $Results += [PSCustomObject]@{
        Test   = "Employee login"
        Status = 200
        Result = "PASS"
    }

    $employeeToken = $employee.token
    $employeeHeaders = Get-AuthHeaders $employeeToken
    $employeeId = $employee.userId

    Write-Host "       Employee ID   : $employeeId"
    Write-Host "       Employee Email: $($employee.email)"
    Write-Host "       Employee Role : $($employee.role)"
}
else {

    Write-Host "[FAIL] Employee login" -ForegroundColor Red
    $Failed++

    $employeeHeaders = $null
}

Write-Host ""

# ============================================================
# 16. EMPLOYEE AUTHORIZATION
# ============================================================

if ($employeeHeaders) {

    Write-Host "16. EMPLOYEE AUTHORIZATION" -ForegroundColor Yellow

    Test-Api `
        -Name "Employee -> Customers" `
        -Url "$BaseUrl/customers" `
        -Headers $employeeHeaders `
        -ExpectedStatus @(200)

    Test-Api `
        -Name "Employee -> Tickets" `
        -Url "$BaseUrl/tickets" `
        -Headers $employeeHeaders `
        -ExpectedStatus @(200)

    Test-Api `
        -Name "Employee -> Messages" `
        -Url "$BaseUrl/messages" `
        -Headers $employeeHeaders `
        -ExpectedStatus @(200)

    Test-Api `
        -Name "Employee -> Categories" `
        -Url "$BaseUrl/categories" `
        -Headers $employeeHeaders `
        -ExpectedStatus @(200)

    Test-Api `
        -Name "Employee -> Incidents" `
        -Url "$BaseUrl/incidents" `
        -Headers $employeeHeaders `
        -ExpectedStatus @(200)

    Test-Api `
        -Name "Employee -> Employees must be forbidden" `
        -Url "$BaseUrl/employees" `
        -Headers $employeeHeaders `
        -ExpectedStatus @(403)

    if ($ticketId) {

        Test-Api `
            -Name "Employee -> Ticket details" `
            -Url "$BaseUrl/tickets/$ticketId" `
            -Headers $employeeHeaders `
            -ExpectedStatus @(200)

        Test-Api `
            -Name "Employee -> AI Analysis" `
            -Url "$BaseUrl/tickets/$ticketId/analyze" `
            -Headers $employeeHeaders `
            -ExpectedStatus @(200)

        Test-Api `
            -Name "Employee -> Delete Ticket must be forbidden" `
            -Method "DELETE" `
            -Url "$BaseUrl/tickets/$ticketId" `
            -Headers $employeeHeaders `
            -ExpectedStatus @(403)
    }

    Write-Host ""
}

# ============================================================
# 17. INVALID JWT
# ============================================================

Write-Host "17. INVALID JWT PROTECTION" -ForegroundColor Yellow

$invalidHeaders = @{
    Authorization = "Bearer this-is-not-a-valid-jwt"
}

Test-Api `
    -Name "Invalid JWT must return 401" `
    -Url "$BaseUrl/customers" `
    -Headers $invalidHeaders `
    -ExpectedStatus @(401)

Write-Host ""

# ============================================================
# 18. ADMIN STILL WORKS
# ============================================================

Write-Host "18. ADMIN REGRESSION CHECK" -ForegroundColor Yellow

Test-Api `
    -Name "Admin -> Customers after all operations" `
    -Url "$BaseUrl/customers" `
    -Headers $adminHeaders `
    -ExpectedStatus @(200)

Test-Api `
    -Name "Admin -> Employees after all operations" `
    -Url "$BaseUrl/employees" `
    -Headers $adminHeaders `
    -ExpectedStatus @(200)

Test-Api `
    -Name "Admin -> Tickets after all operations" `
    -Url "$BaseUrl/tickets" `
    -Headers $adminHeaders `
    -ExpectedStatus @(200)

Write-Host ""

# ============================================================
# FINAL SUMMARY
# ============================================================

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " TEST SUMMARY" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "Passed: $Passed" -ForegroundColor Green
Write-Host "Failed: $Failed" -ForegroundColor Red
Write-Host "Total : $($Passed + $Failed)" -ForegroundColor Cyan
Write-Host ""

if ($Failed -eq 0) {
    Write-Host "ALL TESTS PASSED SUCCESSFULLY!" -ForegroundColor Green
}
else {
    Write-Host "SOME TESTS FAILED - REVIEW THE RESULTS ABOVE." -ForegroundColor Red
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan

# Detailed result table
Write-Host ""
$Results | Format-Table -AutoSize