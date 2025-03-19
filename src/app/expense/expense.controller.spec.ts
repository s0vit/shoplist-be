import { Test, TestingModule } from '@nestjs/testing';
import { ExpenseController } from './expense.controller';
import { ExpenseService } from './expense.service';
import { AccessJwtGuard } from '../../guards/access-jwt.guard';
import { ExpenseOutputDto } from './dto/expense-output.dto';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { EXPENSE_ERROR } from './constants/expense-error.enum';

describe('ExpenseController', () => {
  let controller: ExpenseController;
  let service: ExpenseService;

  const mockExpenseOutput: ExpenseOutputDto = {
    _id: 'expense-id',
    userId: 'user-id',
    amount: 100,
    categoryId: 'category-id',
    paymentSourceId: 'payment-source-id',
    currency: 'USD',
    exchangeRates: { USD: 1, EUR: 0.85 },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockFile = {
    buffer: Buffer.from('test'),
    mimetype: 'image/jpeg',
  } as Express.Multer.File;

  const mockRequest = {
    user: {
      userId: 'user-id',
    },
  };

  beforeEach(async () => {
    const mockExpenseService = {
      uploadPhoto: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExpenseController],
      providers: [
        {
          provide: ExpenseService,
          useValue: mockExpenseService,
        },
      ],
    })
      .overrideGuard(AccessJwtGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<ExpenseController>(ExpenseController);
    service = module.get<ExpenseService>(ExpenseService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadPhoto', () => {
    it('should call service.uploadPhoto and return the result', async () => {
      const mockExpenseWithPhoto = {
        ...mockExpenseOutput,
        photo: 'https://cloudinary.com/image.jpg',
      };

      jest.spyOn(service, 'uploadPhoto').mockResolvedValue(mockExpenseWithPhoto);

      const result = await controller.uploadPhoto('expense-id', mockFile, mockRequest as any);

      expect(service.uploadPhoto).toHaveBeenCalledWith('expense-id', mockFile, 'user-id');
      expect(result).toEqual(mockExpenseWithPhoto);
    });

    it('should handle NotFoundException from service', async () => {
      jest.spyOn(service, 'uploadPhoto').mockRejectedValue(
        new NotFoundException(EXPENSE_ERROR.EXPENSE_NOT_FOUND),
      );

      await expect(controller.uploadPhoto('expense-id', mockFile, mockRequest as any)).rejects.toThrow(
        new NotFoundException(EXPENSE_ERROR.EXPENSE_NOT_FOUND),
      );
    });

    it('should handle ForbiddenException from service for non-paid users', async () => {
      jest.spyOn(service, 'uploadPhoto').mockRejectedValue(
        new ForbiddenException(EXPENSE_ERROR.NOT_PAID_USER),
      );

      await expect(controller.uploadPhoto('expense-id', mockFile, mockRequest as any)).rejects.toThrow(
        new ForbiddenException(EXPENSE_ERROR.NOT_PAID_USER),
      );
    });

    it('should handle BadRequestException from service for invalid file', async () => {
      jest.spyOn(service, 'uploadPhoto').mockRejectedValue(
        new BadRequestException(EXPENSE_ERROR.FILE_NOT_IMAGE),
      );

      await expect(controller.uploadPhoto('expense-id', mockFile, mockRequest as any)).rejects.toThrow(
        new BadRequestException(EXPENSE_ERROR.FILE_NOT_IMAGE),
      );
    });

    it('should handle other errors from service', async () => {
      jest.spyOn(service, 'uploadPhoto').mockRejectedValue(new Error('Unexpected error'));

      await expect(controller.uploadPhoto('expense-id', mockFile, mockRequest as any)).rejects.toThrow(
        new Error('Unexpected error'),
      );
    });
  });
});