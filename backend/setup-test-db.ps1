# Setup test database for E2E tests
# This script creates the collab_test database if it doesn't exist

$DB_HOST = if ($env:DB_HOST) { $env:DB_HOST } else { "localhost" }
$DB_PORT = if ($env:DB_PORT) { $env:DB_PORT } else { "5432" }
$DB_USERNAME = if ($env:DB_USERNAME) { $env:DB_USERNAME } else { "postgres" }
$DB_PASSWORD = if ($env:DB_PASSWORD) { $env:DB_PASSWORD } else { "postgres" }
$DB_TEST_NAME = "collab_test"

Write-Host "Creating test database: $DB_TEST_NAME" -ForegroundColor Cyan

# Set password for psql
$env:PGPASSWORD = $DB_PASSWORD

# Check if database exists
$dbExists = & psql -h $DB_HOST -p $DB_PORT -U $DB_USERNAME -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_TEST_NAME'" 2>$null

if ($dbExists -eq "1") {
    Write-Host "Test database '$DB_TEST_NAME' already exists. Dropping and recreating..." -ForegroundColor Yellow
    # Terminate existing connections
    & psql -h $DB_HOST -p $DB_PORT -U $DB_USERNAME -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_TEST_NAME' AND pid <> pg_backend_pid();" 2>&1 | Out-Null
    & psql -h $DB_HOST -p $DB_PORT -U $DB_USERNAME -d postgres -c "DROP DATABASE IF EXISTS $DB_TEST_NAME;" 2>&1 | Out-Null
}

# Create database
& psql -h $DB_HOST -p $DB_PORT -U $DB_USERNAME -d postgres -c "CREATE DATABASE $DB_TEST_NAME;" 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "Test database '$DB_TEST_NAME' created successfully!" -ForegroundColor Green
} else {
    Write-Host "Failed to create test database" -ForegroundColor Red
    exit 1
}

# Clear password
$env:PGPASSWORD = $null
