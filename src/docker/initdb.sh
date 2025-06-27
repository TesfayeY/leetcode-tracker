#!/bin/bash
set -e

# Debugging: Print the environment variables
echo "MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}"
echo "DATABASE_CONTAINER_USERNAME: ${MYSQL_USER}"
echo "MYSQL_PASSWORD: ${MYSQL_PASSWORD}"
echo "MYSQL_DATABASE: ${MYSQL_DATABASE}"

# Validate environment variables
if [ -z "${MYSQL_ROOT_PASSWORD}" ]; then
    echo "Error: MYSQL_ROOT_PASSWORD is not set"
    exit 1
fi

if [ -z "${MYSQL_USER}" ]; then
    echo "Error: MYSQL_USER is not set"
    exit 1
fi

if [ -z "${MYSQL_PASSWORD}" ]; then
    echo "Error: MYSQL_PASSWORD is not set"
    exit 1
fi

if [ -z "${MYSQL_DATABASE}" ]; then
    echo "Error: MYSQL_DATABASE is not set"
    exit 1
fi

mysql -u root -p"${MYSQL_ROOT_PASSWORD}" <<-EOSQL
    CREATE DATABASE IF NOT EXISTS \`${MYSQL_DATABASE}\`;
    CREATE USER IF NOT EXISTS '${MYSQL_USER}'@'%' IDENTIFIED BY '${MYSQL_PASSWORD}';
    GRANT ALL PRIVILEGES ON \`${MYSQL_DATABASE}\`.* TO '${MYSQL_USER}'@'%';
    FLUSH PRIVILEGES;
EOSQL