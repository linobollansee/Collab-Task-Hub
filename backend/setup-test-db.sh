#!/bin/bash
# Setup test database for E2E tests
# This script creates the collab_test database if it doesn't exist

DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_USERNAME=${DB_USERNAME:-postgres}
DB_PASSWORD=${DB_PASSWORD:-postgres}
DB_TEST_NAME="collab_test"

echo -e "\033[0;36mCreating test database: $DB_TEST_NAME\033[0m"

# Set password for psql
export PGPASSWORD=$DB_PASSWORD

# Check if database exists
DB_EXISTS=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USERNAME -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_TEST_NAME'" 2>/dev/null)

if [ "$DB_EXISTS" = "1" ]; then
    echo -e "\033[0;33mTest database '$DB_TEST_NAME' already exists. Dropping and recreating...\033[0m"
    psql -h $DB_HOST -p $DB_PORT -U $DB_USERNAME -d postgres -c "DROP DATABASE $DB_TEST_NAME;" 2>&1 > /dev/null
fi

# Create database
psql -h $DB_HOST -p $DB_PORT -U $DB_USERNAME -d postgres -c "CREATE DATABASE $DB_TEST_NAME;" 2>&1 > /dev/null

if [ $? -eq 0 ]; then
    echo -e "\033[0;32m✓ Test database '$DB_TEST_NAME' created successfully!\033[0m"
else
    echo -e "\033[0;31m✗ Failed to create test database\033[0m"
    exit 1
fi

# Clear password
unset PGPASSWORD
