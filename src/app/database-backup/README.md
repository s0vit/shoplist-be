# Database Backup Module

This module provides automated nightly backups of the MongoDB database used by the application.

## Features

- Automated nightly backups at midnight UTC
- Backup files are stored in the `backups` directory at the project root
- Automatic cleanup of backups older than 7 days
- Manual backup trigger via API endpoint

## Requirements

- `mongodump` command-line tool must be installed on the server
- The server must have write access to the `backups` directory

## Configuration

The module uses the following environment variables:

- `DB_ADMIN_NAME`: MongoDB admin username
- `DB_ADMIN_PASSWORD`: MongoDB admin password
- `DB_NAME`: MongoDB database name

These variables should already be configured for the main application.

## API Endpoints

### Manually Trigger a Backup

```
POST /database-backup/manual-backup
```

This endpoint requires authentication with a valid JWT token.

**Response:**

```json
{
  "message": "Database backup process has been initiated."
}
```

## Implementation Details

The backup process uses the `mongodump` command-line tool to create a backup of the MongoDB database. The backup is stored in a directory named with the database name and a timestamp.

The backup process is scheduled to run every day at midnight UTC using NestJS's scheduling capabilities.

Old backups (older than 7 days) are automatically cleaned up to prevent disk space issues.

## Troubleshooting

If backups are not being created, check the following:

1. Ensure that the `mongodump` command-line tool is installed on the server
2. Verify that the environment variables are correctly set
3. Check the application logs for any error messages related to the backup process
4. Ensure that the server has write access to the `backups` directory