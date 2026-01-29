# Comprehensive Backend API Test Suite
# Tests all REST API endpoints for Collab Task Hub

param(
    [string]$BaseUrl = "http://localhost:4000",
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"
$testsPassed = 0
$testsFailed = 0
$testEmail = "apitest_$(Get-Date -Format 'yyyyMMddHHmmss')@example.com"
$testPassword = "TestPassword123!"
$testName = "API Test User"
$token = $null
$userId = $null
$projectId = $null
$taskId = $null
$memberId = $null
$secondUserId = $null

function Write-TestHeader {
    param([string]$message)
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host $message -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
}

function Write-TestStep {
    param([string]$message)
    Write-Host "`n[$testsPassed] $message" -ForegroundColor Yellow
}

function Write-Success {
    param([string]$message)
    $script:testsPassed++
    Write-Host "  [PASS] $message" -ForegroundColor Green
}

function Write-Failure {
    param([string]$message, [string]$detail = "")
    $script:testsFailed++
    Write-Host "  [FAIL] $message" -ForegroundColor Red
    if ($detail) {
        Write-Host "    Details: $detail" -ForegroundColor Gray
    }
}

function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Uri,
        [object]$Body = $null,
        [hashtable]$Headers = @{},
        [int]$ExpectedStatus = 200,
        [string]$Description
    )

    try {
        $params = @{
            Uri = "$BaseUrl$Uri"
            Method = $Method
            Headers = $Headers
            ContentType = "application/json"
        }

        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 10)
        }

        if ($Verbose) {
            Write-Host "    Request: $Method $Uri" -ForegroundColor Gray
        }

        $response = Invoke-RestMethod @params
        
        # If we got here without exception, status was 2xx
        if ($ExpectedStatus -ge 200 -and $ExpectedStatus -lt 300) {
            Write-Success $Description
            return $response
        } else {
            Write-Failure $Description "Expected status $ExpectedStatus but got 200-299"
            return $null
        }
    }
    catch {
        $statusCode = 500
        if ($_.Exception.Response) {
            $statusCode = [int]$_.Exception.Response.StatusCode
        }
        
        if ($statusCode -eq $ExpectedStatus) {
            Write-Success $Description
            return $null
        } else {
            Write-Failure $Description "Expected status $ExpectedStatus but got $statusCode - $($_.Exception.Message)"
            if ($Verbose) {
                Write-Host "    Error: $($_.ErrorDetails.Message)" -ForegroundColor Gray
            }
            return $null
        }
    }
}

# ========================================
# START TESTS
# ========================================

Write-TestHeader "COLLAB TASK HUB - API TEST SUITE"
Write-Host "Base URL: $BaseUrl" -ForegroundColor Gray
Write-Host "Test User: $testEmail" -ForegroundColor Gray
Write-Host ""

# ========================================
# HEALTH CHECK
# ========================================
Write-TestHeader "1. HEALTH CHECK"

Write-TestStep "Testing health endpoint"
$healthResponse = Test-Endpoint -Method GET -Uri "/health" -Description "GET /health returns service status"

if ($healthResponse -and $healthResponse.status -eq "ok") {
    Write-Success "Health check contains status field"
}

# ========================================
# AUTHENTICATION
# ========================================
Write-TestHeader "2. AUTHENTICATION TESTS"

Write-TestStep "Register new user"
$registerBody = @{
    email = $testEmail
    name = $testName
    password = $testPassword
}
$registerResponse = Test-Endpoint -Method POST -Uri "/auth/register" -Body $registerBody -Description "POST /auth/register creates new user"

if ($registerResponse) {
    $token = $registerResponse.access_token
    $userId = $registerResponse.user.id
    Write-Success "Registration returned JWT token"
    Write-Success "Registration returned user ID: $userId"
}

Write-TestStep "Login with valid credentials"
$loginBody = @{
    email = $testEmail
    password = $testPassword
}
$loginResponse = Test-Endpoint -Method POST -Uri "/auth/login" -Body $loginBody -Description "POST /auth/login with valid credentials"

if ($loginResponse) {
    $token = $loginResponse.access_token
    Write-Success "Login returned JWT token"
}

Write-TestStep "Login with invalid password"
$badLoginBody = @{
    email = $testEmail
    password = "wrongpassword"
}
Test-Endpoint -Method POST -Uri "/auth/login" -Body $badLoginBody -ExpectedStatus 401 -Description "POST /auth/login with invalid password returns 401"

Write-TestStep "Login with non-existent user"
$badUserBody = @{
    email = "nonexistent@example.com"
    password = "password"
}
Test-Endpoint -Method POST -Uri "/auth/login" -Body $badUserBody -ExpectedStatus 401 -Description "POST /auth/login with non-existent user returns 401"

Write-TestStep "Get current user profile"
$authHeaders = @{ Authorization = "Bearer $token" }
$meResponse = Test-Endpoint -Method GET -Uri "/auth/me" -Headers $authHeaders -Description "GET /auth/me returns current user"

if ($meResponse -and $meResponse.email -eq $testEmail) {
    Write-Success "User profile email matches"
}

if ($meResponse -and -not ($meResponse.PSObject.Properties.Name -contains "passwordHash")) {
    Write-Success "Password hash excluded from response"
}

Write-TestStep "Access protected route without token"
Test-Endpoint -Method GET -Uri "/auth/me" -ExpectedStatus 401 -Description "GET /auth/me without token returns 401"

# ========================================
# USERS
# ========================================
Write-TestHeader "3. USERS TESTS"

Write-TestStep "Get all users"
$allUsers = Test-Endpoint -Method GET -Uri "/users" -Headers $authHeaders -Description "GET /users returns user list"

if ($allUsers -and $allUsers.Count -gt 0) {
    Write-Success "Users list contains $($allUsers.Count) user(s)"
}

Write-TestStep "Get current user profile via /users/me"
$userMe = Test-Endpoint -Method GET -Uri "/users/me" -Headers $authHeaders -Description "GET /users/me returns current user"

Write-TestStep "Update current user profile"
$updateUserBody = @{
    name = "Updated Test User Name"
}
$updatedUser = Test-Endpoint -Method PATCH -Uri "/users/me" -Headers $authHeaders -Body $updateUserBody -Description "PATCH /users/me updates user profile"

if ($updatedUser -and $updatedUser.name -eq "Updated Test User Name") {
    Write-Success "User name updated successfully"
}

# ========================================
# PROJECTS
# ========================================
Write-TestHeader "4. PROJECTS TESTS"

Write-TestStep "Create a new project"
$createProjectBody = @{
    title = "Test Project"
    description = "This is a test project for API testing"
}
$project = Test-Endpoint -Method POST -Uri "/projects" -Headers $authHeaders -Body $createProjectBody -Description "POST /projects creates new project"

if ($project) {
    $projectId = $project.id
    Write-Success "Project created with ID: $projectId"
    
    if ($project.members -and $project.members.Count -gt 0 -and $project.members[0].role -eq "admin") {
        Write-Success "Creator automatically added as admin"
    }
}

Write-TestStep "Get user's projects"
$userProjects = Test-Endpoint -Method GET -Uri "/projects" -Headers $authHeaders -Description "GET /projects returns user's projects"

if ($userProjects -and $userProjects.Count -gt 0) {
    Write-Success "Projects list contains $($userProjects.Count) project(s)"
}

Write-TestStep "Get all projects (debug endpoint)"
$allProjects = Test-Endpoint -Method GET -Uri "/projects/all" -Description "GET /projects/all returns all projects"

Write-TestStep "Get specific project by ID"
$singleProject = Test-Endpoint -Method GET -Uri "/projects/$projectId" -Description "GET /projects/:id returns project details"

if ($singleProject -and $singleProject.title -eq "Test Project") {
    Write-Success "Project title matches"
}

Write-TestStep "Update project"
$updateProjectBody = @{
    title = "Updated Test Project"
    description = "Updated description for testing"
}
$updatedProject = Test-Endpoint -Method PATCH -Uri "/projects/$projectId" -Headers $authHeaders -Body $updateProjectBody -Description "PATCH /projects/:id updates project"

if ($updatedProject -and $updatedProject.title -eq "Updated Test Project") {
    Write-Success "Project title updated successfully"
}

Write-TestStep "Get user role in project"
$userRole = Test-Endpoint -Method GET -Uri "/projects/$projectId/role" -Headers $authHeaders -Description "GET /projects/:id/role returns user role"

if ($userRole -eq "admin") {
    Write-Success "User role is admin"
}

# Register second user for member tests
Write-TestStep "Register second user for member management tests"
$secondUserEmail = "apitest2_$(Get-Date -Format 'yyyyMMddHHmmss')@example.com"
$secondUserBody = @{
    email = $secondUserEmail
    name = "Second Test User"
    password = $testPassword
}
$secondUserResponse = Test-Endpoint -Method POST -Uri "/auth/register" -Body $secondUserBody -Description "POST /auth/register for second user"

if ($secondUserResponse) {
    $secondUserId = $secondUserResponse.user.id
    Write-Success "Second user created with ID: $secondUserId"
}

Write-TestStep "Add member to project"
$addMemberBody = @{
    userId = $secondUserId
    role = "member"
}
$addMemberResponse = Test-Endpoint -Method POST -Uri "/projects/$projectId/members" -Headers $authHeaders -Body $addMemberBody -Description "POST /projects/:id/members adds member"

if ($addMemberResponse) {
    # Refresh project to get member details
    $refreshedProject = Test-Endpoint -Method GET -Uri "/projects/$projectId" -Headers $authHeaders -Description "GET project to retrieve member ID"
    if ($refreshedProject -and $refreshedProject.members) {
        $member = $refreshedProject.members | Where-Object { $_.userId -eq $secondUserId }
        if ($member) {
            $memberId = $member.id
            Write-Success "Member added successfully with ID: $memberId"
        }
    }
}

Write-TestStep "Update member role"
$updateMemberBody = @{
    role = "viewer"
}
$updateMemberResponse = Test-Endpoint -Method PATCH -Uri "/projects/$projectId/members/$memberId" -Headers $authHeaders -Body $updateMemberBody -Description "PATCH /projects/:id/members/:memberId updates role"

if ($updateMemberResponse) {
    $updatedMember = $updateMemberResponse.members | Where-Object { $_.id -eq $memberId }
    if ($updatedMember -and $updatedMember.role -eq "viewer") {
        Write-Success "Member role updated to viewer"
    }
}

Write-TestStep "Remove member from project"
Test-Endpoint -Method DELETE -Uri "/projects/$projectId/members/$memberId" -Headers $authHeaders -Description "DELETE /projects/:id/members/:memberId removes member"

# ========================================
# TASKS
# ========================================
Write-TestHeader "5. TASKS TESTS"

Write-TestStep "Create a new task"
$createTaskBody = @{
    title = "Test Task"
    description = "This is a test task"
    status = "backlog"
    priority = "high"
    projectId = $projectId
}
$task = Test-Endpoint -Method POST -Uri "/tasks" -Headers $authHeaders -Body $createTaskBody -Description "POST /tasks creates new task"

if ($task) {
    $taskId = $task.id
    Write-Success "Task created with ID: $taskId"
}

Write-TestStep "Get all tasks"
$allTasks = Test-Endpoint -Method GET -Uri "/tasks" -Headers $authHeaders -Description "GET /tasks returns all tasks"

if ($allTasks -and $allTasks.Count -gt 0) {
    Write-Success "Tasks list contains $($allTasks.Count) task(s)"
}

Write-TestStep "Get tasks filtered by project"
$projectTasks = Test-Endpoint -Method GET -Uri "/tasks?projectId=$projectId" -Headers $authHeaders -Description "GET /tasks?projectId filters by project"

Write-TestStep "Get specific task by ID"
$singleTask = Test-Endpoint -Method GET -Uri "/tasks/$taskId" -Headers $authHeaders -Description "GET /tasks/:id returns task details"

if ($singleTask -and $singleTask.title -eq "Test Task") {
    Write-Success "Task title matches"
}

Write-TestStep "Update task"
$updateTaskBody = @{
    title = "Updated Test Task"
    description = "Updated description"
    status = "in_progress"
    priority = "medium"
    assigneeId = $userId
}
$updatedTask = Test-Endpoint -Method PATCH -Uri "/tasks/$taskId" -Headers $authHeaders -Body $updateTaskBody -Description "PATCH /tasks/:id updates task"

if ($updatedTask) {
    if ($updatedTask.title -eq "Updated Test Task") {
        Write-Success "Task title updated"
    }
    if ($updatedTask.status -eq "in_progress") {
        Write-Success "Task status updated to in_progress"
    }
    if ($updatedTask.assigneeId -eq $userId) {
        Write-Success "Task assigned to user"
    }
}

Write-TestStep "Update task status to review"
$statusUpdateBody = @{
    status = "review"
}
$reviewTask = Test-Endpoint -Method PATCH -Uri "/tasks/$taskId" -Headers $authHeaders -Body $statusUpdateBody -Description "PATCH /tasks/:id updates status to review"

Write-TestStep "Update task status to done"
$doneUpdateBody = @{
    status = "done"
}
$doneTask = Test-Endpoint -Method PATCH -Uri "/tasks/$taskId" -Headers $authHeaders -Body $doneUpdateBody -Description "PATCH /tasks/:id updates status to done"

Write-TestStep "Delete task"
Test-Endpoint -Method DELETE -Uri "/tasks/$taskId" -Headers $authHeaders -Description "DELETE /tasks/:id deletes task"

# ========================================
# CHAT
# ========================================
Write-TestHeader "6. CHAT TESTS"

Write-TestStep "Get project messages"
$messages = Test-Endpoint -Method GET -Uri "/chat/projects/$projectId/messages" -Headers $authHeaders -Description "GET /chat/projects/:projectId/messages returns messages"

if ($messages -is [array]) {
    Write-Success "Messages endpoint returns array (count: $($messages.Count))"
}

Write-TestStep "Get project messages with pagination"
$paginatedMessages = Test-Endpoint -Method GET -Uri "/chat/projects/$projectId/messages?limit=10" -Headers $authHeaders -Description "GET /chat/projects/:projectId/messages with pagination"

# Note: PATCH and DELETE chat message endpoints require WebSocket to create messages first
# These are tested separately via WebSocket integration tests

# ========================================
# APP CONTROLLER
# ========================================
Write-TestHeader "7. APP CONTROLLER TESTS"

Write-TestStep "Test root endpoint"
$rootResponse = Test-Endpoint -Method GET -Uri "/" -Description "GET / returns welcome message"

Write-TestStep "Test protected endpoint without token"
Test-Endpoint -Method GET -Uri "/protected" -ExpectedStatus 401 -Description "GET /protected without token returns 401"

Write-TestStep "Test protected endpoint with valid token"
$protectedResponse = Test-Endpoint -Method GET -Uri "/protected" -Headers $authHeaders -Description "GET /protected with valid token"

if ($protectedResponse -and $protectedResponse.message) {
    Write-Success "Protected endpoint returns message"
}

# ========================================
# CLEANUP
# ========================================
Write-TestHeader "8. CLEANUP"

Write-TestStep "Delete test project"
Test-Endpoint -Method DELETE -Uri "/projects/$projectId" -Headers $authHeaders -Description "DELETE /projects/:id deletes project"

Write-TestStep "Verify project deletion"
$projectsAfterDelete = Test-Endpoint -Method GET -Uri "/projects" -Headers $authHeaders -Description "GET /projects after deletion"

if ($projectsAfterDelete) {
    $deletedProject = $projectsAfterDelete | Where-Object { $_.id -eq $projectId }
    if (-not $deletedProject) {
        Write-Success "Project successfully deleted"
    }
}

# ========================================
# SUMMARY
# ========================================
Write-TestHeader "TEST SUMMARY"

Write-Host ""
Write-Host "Total Tests Passed: $testsPassed" -ForegroundColor Green
Write-Host "Total Tests Failed: $testsFailed" -ForegroundColor $(if ($testsFailed -gt 0) { "Red" } else { "Green" })
Write-Host ""

if ($testsFailed -eq 0) {
    Write-Host "ALL TESTS PASSED!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "SOME TESTS FAILED" -ForegroundColor Red
    exit 1
}
