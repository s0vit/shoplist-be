import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseBackupService } from './database-backup.service';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as child_process from 'child_process';
import { Logger } from '@nestjs/common';

jest.mock('fs');
jest.mock('path');
jest.mock('child_process');
jest.mock('@nestjs/common', () => ({
  ...jest.requireActual('@nestjs/common'),
  Logger: jest.fn().mockImplementation(() => ({
    log: jest.fn(),
    error: jest.fn(),
  })),
}));

describe('DatabaseBackupService', () => {
  let service: DatabaseBackupService;
  let configService: ConfigService;
  let mockExec: jest.Mock;

  const mockBackupDir = '/mock/backup/dir';
  const mockDbAdminName = 'admin';
  const mockDbAdminPassword = 'password';
  const mockDbName = 'testdb';

  beforeEach(async () => {
    jest.clearAllMocks();

    // Mock path.join to return a predictable path
    (path.join as jest.Mock).mockImplementation((...args) => {
      if (args[1] === 'backups') {
        return mockBackupDir;
      }
      return args.join('/');
    });

    // Mock fs.existsSync to return false (directory doesn't exist)
    (fs.existsSync as jest.Mock).mockReturnValue(false);

    // Mock fs.mkdirSync to do nothing
    (fs.mkdirSync as jest.Mock).mockImplementation(() => {});

    // Mock exec to return a successful result
    mockExec = jest.fn().mockResolvedValue({
      stdout: 'Backup completed',
      stderr: 'done dumping',
    });
    (child_process.exec as unknown as jest.Mock) = mockExec;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseBackupService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key) => {
              const values = {
                DB_ADMIN_NAME: mockDbAdminName,
                DB_ADMIN_PASSWORD: mockDbAdminPassword,
                DB_NAME: mockDbName,
              };
              return values[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<DatabaseBackupService>(DatabaseBackupService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('constructor', () => {
    it('should create backup directory if it does not exist', () => {
      expect(fs.existsSync).toHaveBeenCalledWith(mockBackupDir);
      expect(fs.mkdirSync).toHaveBeenCalledWith(mockBackupDir, { recursive: true });
    });

    it('should not create backup directory if it already exists', () => {
      jest.clearAllMocks();
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      // Re-instantiate the service to trigger constructor
      new DatabaseBackupService(configService);

      expect(fs.existsSync).toHaveBeenCalledWith(mockBackupDir);
      expect(fs.mkdirSync).not.toHaveBeenCalled();
    });
  });

  describe('createDatabaseBackup', () => {
    it('should execute mongodump command with correct parameters', async () => {
      const mockDate = new Date('2023-01-01T00:00:00Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

      await service.createDatabaseBackup();

      const expectedTimestamp = '2023-01-01T00-00-00Z';
      const expectedBackupPath = `${mockBackupDir}/${mockDbName}-${expectedTimestamp}`;
      const expectedCommand = `mongodump --uri="mongodb+srv://${mockDbAdminName}:${mockDbAdminPassword}@cluster0.fujwcru.mongodb.net/${mockDbName}" --out=${expectedBackupPath}`;

      expect(mockExec).toHaveBeenCalledWith(expectedCommand, expect.any(Function));
    });

    it('should not execute mongodump if database credentials are missing', async () => {
      jest.spyOn(configService, 'get').mockReturnValue(null);

      await service.createDatabaseBackup();

      expect(mockExec).not.toHaveBeenCalled();
    });

    it('should handle errors during backup', async () => {
      mockExec.mockRejectedValue(new Error('Command failed'));

      await service.createDatabaseBackup();

      // Verify that the error was logged but no exception was thrown
      expect(service['logger'].error).toHaveBeenCalled();
    });

    it('should log error if stderr contains error message', async () => {
      mockExec.mockResolvedValue({
        stdout: '',
        stderr: 'Error: connection failed',
      });

      await service.createDatabaseBackup();

      expect(service['logger'].error).toHaveBeenCalled();
    });

    it('should call cleanupOldBackups after successful backup', async () => {
      const cleanupSpy = jest.spyOn(service as any, 'cleanupOldBackups').mockResolvedValue(undefined);

      await service.createDatabaseBackup();

      expect(cleanupSpy).toHaveBeenCalled();
    });
  });

  describe('cleanupOldBackups', () => {
    it('should delete files older than 7 days', async () => {
      const now = new Date('2023-01-08').getTime();
      jest.spyOn(Date.prototype, 'getTime').mockReturnValue(now);

      const mockFiles = ['file1', 'file2', 'file3'];
      (fs.readdirSync as jest.Mock).mockReturnValue(mockFiles);

      // Mock file stats to make some files older than 7 days
      (fs.statSync as jest.Mock).mockImplementation((filePath) => {
        const fileStats = {
          mtime: {
            getTime: () => {
              if (filePath.includes('file1')) {
                // 8 days old
                return now - 8 * 24 * 60 * 60 * 1000;
              }
              if (filePath.includes('file2')) {
                // 6 days old
                return now - 6 * 24 * 60 * 60 * 1000;
              }
              // 10 days old
              return now - 10 * 24 * 60 * 60 * 1000;
            },
          },
        };
        return fileStats;
      });

      (fs.rmSync as jest.Mock) = jest.fn();

      await service['cleanupOldBackups']();

      // Should delete file1 and file3 (older than 7 days)
      expect(fs.rmSync).toHaveBeenCalledTimes(2);
      expect(fs.rmSync).toHaveBeenCalledWith(`${mockBackupDir}/file1`, { recursive: true, force: true });
      expect(fs.rmSync).toHaveBeenCalledWith(`${mockBackupDir}/file3`, { recursive: true, force: true });
      expect(fs.rmSync).not.toHaveBeenCalledWith(`${mockBackupDir}/file2`, { recursive: true, force: true });
    });

    it('should handle errors during cleanup', async () => {
      (fs.readdirSync as jest.Mock).mockImplementation(() => {
        throw new Error('Read directory failed');
      });

      await service['cleanupOldBackups']();

      expect(service['logger'].error).toHaveBeenCalled();
    });
  });

  describe('manualBackup', () => {
    it('should call createDatabaseBackup', async () => {
      const createBackupSpy = jest.spyOn(service, 'createDatabaseBackup').mockResolvedValue();

      await service.manualBackup();

      expect(createBackupSpy).toHaveBeenCalled();
      expect(service['logger'].log).toHaveBeenCalledWith('Manually triggering database backup');
    });
  });
});