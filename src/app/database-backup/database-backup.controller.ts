import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DatabaseBackupService } from './database-backup.service';
import { AccessJwtGuard } from '../../guards/access-jwt.guard';
import { ManualBackupSwDec } from './decorators/manual-backup-sw.decorator';

@ApiTags('Database Backup')
@Controller('database-backup')
export class DatabaseBackupController {
  constructor(private readonly databaseBackupService: DatabaseBackupService) {}

  @Post('manual-backup')
  @UseGuards(AccessJwtGuard)
  @ManualBackupSwDec()
  async manualBackup(): Promise<{ message: string }> {
    await this.databaseBackupService.manualBackup();

    return { message: 'Database backup process has been initiated.' };
  }
}
