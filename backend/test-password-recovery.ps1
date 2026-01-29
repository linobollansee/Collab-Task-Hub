#!/usr/bin/env pwsh
# Password Recovery Test Script
# Tests the forgot-password and reset-password endpoints

Write-Host ""
Write-Host "=== Password Recovery Test ===" -ForegroundColor Cyan
Write-Host "Testing password reset flow..." -ForegroundColor Cyan
Write-Host ""

$API_URL = "http://localhost:4000"
$TEST_EMAIL = "test@example.com"
$TEST_NAME = "Test User"
$TEST_PASSWORD = "password123"
$NEW_PASSWORD = "newPassword456"

# Function to make API requests
function Invoke-ApiRequest {
    param(
        [string]$Method,
        [string]$Endpoint,
        [hashtable]$Body = $null
    )
    
    try {
        $params = @{
            Uri = "$API_URL$Endpoint"
            Method = $Method
            ContentType = "application/json"
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json)
        }
        
        $response = Invoke-RestMethod @params
        return $response
    }
    catch {
        Write-Host "Error: $_" -ForegroundColor Red
        if ($_.ErrorDetails.Message) {
            Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
        }
        return $null
    }
}

# Step 1: Register a test user
Write-Host "[1/4] Registering test user..." -ForegroundColor Yellow
$registerBody = @{
    email = $TEST_EMAIL
    name = $TEST_NAME
    password = $TEST_PASSWORD
}

$registerResponse = Invoke-ApiRequest -Method POST -Endpoint "/auth/register" -Body $registerBody

if ($registerResponse) {
    Write-Host "OK User registered successfully" -ForegroundColor Green
} else {
    Write-Host "Note: User might already exist, continuing..." -ForegroundColor Yellow
}

Start-Sleep -Seconds 1

# Step 2: Request password reset
Write-Host ""
Write-Host "[2/4] Requesting password reset..." -ForegroundColor Yellow
$forgotBody = @{
    email = $TEST_EMAIL
}

$forgotResponse = Invoke-ApiRequest -Method POST -Endpoint "/auth/forgot-password" -Body $forgotBody

if ($forgotResponse) {
    Write-Host "OK Response: $($forgotResponse.message)" -ForegroundColor Green
} else {
    Write-Host "FAIL Failed to request password reset" -ForegroundColor Red
    exit 1
}

Start-Sleep -Seconds 2

# Step 3: Get reset token from database
Write-Host ""
Write-Host "[3/4] Retrieving reset token from database..." -ForegroundColor Yellow

try {
    $sqlQuery = "SELECT \`"resetPasswordToken\`", \`"resetPasswordExpires\`" FROM users WHERE email = '$TEST_EMAIL';"
    $dbResult = docker exec collab-task-hub-db psql -U postgres -d collab_task_hub -t -A -c $sqlQuery 2>&1
    
    if ($LASTEXITCODE -eq 0 -and $dbResult) {
        $parts = $dbResult -split '\|'
        $resetToken = $parts[0].Trim()
        $expiresAt = $parts[1].Trim()
        
        if ($resetToken -and $resetToken -ne "") {
            Write-Host "OK Reset token retrieved: $resetToken" -ForegroundColor Green
            Write-Host "  Expires at: $expiresAt" -ForegroundColor Cyan
        } else {
            Write-Host "FAIL No reset token found in database" -ForegroundColor Red
            Write-Host "  This means the email service might have failed" -ForegroundColor Yellow
            exit 1
        }
    } else {
        Write-Host "FAIL Failed to query database" -ForegroundColor Red
        Write-Host "  Make sure Docker containers are running" -ForegroundColor Yellow
        Write-Host "  Error output: $dbResult" -ForegroundColor Red
        exit 1
    }
}
catch {
    Write-Host "FAIL Error accessing database: $_" -ForegroundColor Red
    exit 1
}

Start-Sleep -Seconds 1

# Step 4: Reset password using token
Write-Host ""
Write-Host "[4/4] Resetting password with token..." -ForegroundColor Yellow
$resetBody = @{
    token = $resetToken
    newPassword = $NEW_PASSWORD
}

$resetResponse = Invoke-ApiRequest -Method POST -Endpoint "/auth/reset-password" -Body $resetBody

if ($resetResponse) {
    Write-Host "OK $($resetResponse.message)" -ForegroundColor Green
} else {
    Write-Host "FAIL Failed to reset password" -ForegroundColor Red
    exit 1
}

Start-Sleep -Seconds 1

# Step 5: Verify new password works
Write-Host ""
Write-Host "[5/5] Verifying new password..." -ForegroundColor Yellow
$loginBody = @{
    email = $TEST_EMAIL
    password = $NEW_PASSWORD
}

$loginResponse = Invoke-ApiRequest -Method POST -Endpoint "/auth/login" -Body $loginBody

if ($loginResponse -and $loginResponse.access_token) {
    Write-Host "OK Login successful with new password" -ForegroundColor Green
} else {
    Write-Host "FAIL Failed to login with new password" -ForegroundColor Red
    exit 1
}

# Summary
Write-Host ""
Write-Host "=== Test Complete ===" -ForegroundColor Cyan
Write-Host "OK All password recovery tests passed!" -ForegroundColor Green
Write-Host ""
Write-Host "Password recovery flow:" -ForegroundColor Cyan
Write-Host "  1. User registered: $TEST_EMAIL" -ForegroundColor White
Write-Host "  2. Reset requested: Token generated and saved" -ForegroundColor White
Write-Host "  3. Password reset: Successfully changed password" -ForegroundColor White
Write-Host "  4. Login verified: New password works" -ForegroundColor White
Write-Host ""
Write-Host "Note: Check your email ($TEST_EMAIL) for the reset link" -ForegroundColor Yellow
Write-Host "      If no email arrived, verify Mailjet sender is verified" -ForegroundColor Yellow
Write-Host ""

