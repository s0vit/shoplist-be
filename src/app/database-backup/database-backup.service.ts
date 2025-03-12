import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execPromise = promisify(exec);

@Injectable()
export class DatabaseBackupService {
  private readonly logger = new Logger(DatabaseBackupService.name);
  private readonly backupDir = path.join(process.cwd(), 'backups');

  constructor(private readonly configService: ConfigService) {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
      this.logger.log(`Created backup directory at ${this.backupDir}`);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    timeZone: 'UTC',
  })
  async createDatabaseBackup(): Promise<void> {
    try {
      const dbAdminName = this.configService.get<string>('DB_ADMIN_NAME');
      const dbAdminPassword = this.configService.get<string>('DB_ADMIN_PASSWORD');
      const dbName = this.configService.get<string>('DB_NAME');
      const dbHost = 'cluster0.fujwcru.mongodb.net';

      if (!dbAdminName || !dbAdminPassword || !dbName) {
        this.logger.error('Database credentials not found in environment variables');

        return;
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFilePath = path.join(this.backupDir, `${dbName}-${timestamp}`);

      const mongodumpCommand = `mongodump --uri="mongodb+srv://${dbAdminName}:${dbAdminPassword}@${dbHost}/${dbName}" --out=${backupFilePath}`;

      this.logger.log(`Starting database backup to ${backupFilePath}`);
      const { stdout, stderr } = await execPromise(mongodumpCommand);

      if (stderr && !stderr.includes('done dumping')) {
        this.logger.error(`Error during backup: ${stderr}`);

        return;
      }

      this.logger.log(`Database backup completed successfully: ${stdout}`);

      // Clean up old backups (keep only the last 7 days)
      this.cleanupOldBackups();
    } catch (error) {
      this.logger.error(`Failed to create database backup: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async cleanupOldBackups(): Promise<void> {
    try {
      const files = fs.readdirSync(this.backupDir);
      const now = new Date().getTime();
      const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;

      for (const file of files) {
        const filePath = path.join(this.backupDir, file);
        const stats = fs.statSync(filePath);
        const fileAge = now - stats.mtime.getTime();

        if (fileAge > sevenDaysInMs) {
          fs.rmSync(filePath, { recursive: true, force: true });
          this.logger.log(`Deleted old backup: ${filePath}`);
        }
      }
    } catch (error) {
      this.logger.error(`Failed to clean up old backups: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Manually trigger a database backup
   * This method can be used for testing or to manually create a backup
   */
  async manualBackup(): Promise<void> {
    this.logger.log('Manually triggering database backup');
    await this.createDatabaseBackup();
  }
}
