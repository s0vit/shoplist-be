import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseBackupController } from './database-backup.controller';
import { DatabaseBackupService } from './database-backup.service';
import { AccessJwtGuard } from '../../guards/access-jwt.guard';

describe('DatabaseBackupController', () => {
  let controller: DatabaseBackupController;
  let service: DatabaseBackupService;

  beforeEach(async () => {
    const mockDatabaseBackupService = {
      manualBackup: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DatabaseBackupController],
      providers: [
        {
          provide: DatabaseBackupService,
          useValue: mockDatabaseBackupService,
        },
      ],
    })
      .overrideGuard(AccessJwtGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<DatabaseBackupController>(DatabaseBackupController);
    service = module.get<DatabaseBackupService>(DatabaseBackupService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('manualBackup', () => {
    it('should call service.manualBackup and return success message', async () => {
      const result = await controller.manualBackup();

      expect(service.manualBackup).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Database backup process has been initiated.' });
    });

    it('should handle errors from service.manualBackup', async () => {
      jest.spyOn(service, 'manualBackup').mockRejectedValue(new Error('Backup failed'));

      await expect(controller.manualBackup()).rejects.toThrow('Backup failed');
    });
  });
});
