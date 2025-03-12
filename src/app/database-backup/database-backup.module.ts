import { Module } from '@nestjs/common';
import { DatabaseBackupService } from './database-backup.service';
import { DatabaseBackupController } from './database-backup.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [DatabaseBackupController],
  providers: [DatabaseBackupService],
  exports: [DatabaseBackupService],
})
export class DatabaseBackupModule {}
