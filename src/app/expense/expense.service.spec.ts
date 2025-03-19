import { Test, TestingModule } from '@nestjs/testing';
import { ExpenseService } from './expense.service';
import { getModelToken } from '@nestjs/mongoose';
import { Expense } from './models/expense.model';
import { AccessControlService } from '../access-control/access-control.service';
import { CurrencyService } from '../currency/currency.service';
import { FamilyBudgetService } from '../family-budget/family-budget.service';
import { CronExpenseService } from '../cron-expenses/cron-expense.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UserService } from '../user/user.service';
import { UtilsService } from '../../common/utils/utils.service';
import { BadRequestException, ForbiddenException, HttpException, NotFoundException } from '@nestjs/common';
import { EXPENSE_ERROR } from './constants/expense-error.enum';
import { Model } from 'mongoose';

describe('ExpenseService', () => {
  let service: ExpenseService;
  let expensesModel: Model<Expense>;
  let accessControlService: AccessControlService;
  let userService: UserService;
  let cloudinaryService: CloudinaryService;
  let utilsService: UtilsService;

  const mockExpense = {
    _id: 'expense-id',
    userId: 'user-id',
    amount: 100,
    categoryId: 'category-id',
    paymentSourceId: 'payment-source-id',
    currency: 'USD',
    exchangeRates: { USD: 1, EUR: 0.85 },
    createdAt: new Date(),
    updatedAt: new Date(),
    toObject: jest.fn().mockReturnThis(),
  };

  const mockUser = {
    _id: 'user-id',
    email: 'test@example.com',
    isPaid: true,
  };

  const mockFile = {
    buffer: Buffer.from('test'),
    mimetype: 'image/jpeg',
  } as Express.Multer.File;

  const mockCloudinaryResponse = {
    secure_url: 'https://cloudinary.com/image.jpg',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpenseService,
        {
          provide: getModelToken(Expense.name),
          useValue: {
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            find: jest.fn(),
            lean: jest.fn(),
          },
        },
        {
          provide: AccessControlService,
          useValue: {
            checkAccess: jest.fn(),
          },
        },
        {
          provide: CurrencyService,
          useValue: {},
        },
        {
          provide: FamilyBudgetService,
          useValue: {},
        },
        {
          provide: CronExpenseService,
          useValue: {},
        },
        {
          provide: CloudinaryService,
          useValue: {
            uploadImage: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: UtilsService,
          useValue: {
            convertToWebP: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ExpenseService>(ExpenseService);
    expensesModel = module.get<Model<Expense>>(getModelToken(Expense.name));
    accessControlService = module.get<AccessControlService>(AccessControlService);
    userService = module.get<UserService>(UserService);
    cloudinaryService = module.get<CloudinaryService>(CloudinaryService);
    utilsService = module.get<UtilsService>(UtilsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadPhoto', () => {
    it('should throw NotFoundException if expense not found', async () => {
      jest.spyOn(expensesModel, 'findById').mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(service.uploadPhoto('expense-id', mockFile, 'user-id')).rejects.toThrow(
        new NotFoundException(EXPENSE_ERROR.EXPENSE_NOT_FOUND),
      );
    });

    it('should throw ForbiddenException if user does not have access to the expense', async () => {
      jest.spyOn(expensesModel, 'findById').mockReturnValue({
        lean: jest.fn().mockResolvedValue({ ...mockExpense, userId: 'other-user-id' }),
      } as any);

      jest.spyOn(accessControlService, 'checkAccess').mockResolvedValue(false);

      await expect(service.uploadPhoto('expense-id', mockFile, 'user-id')).rejects.toThrow(
        new ForbiddenException(EXPENSE_ERROR.FORBIDDEN),
      );
    });

    it('should throw ForbiddenException if user is not a paid user', async () => {
      jest.spyOn(expensesModel, 'findById').mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockExpense),
      } as any);

      jest.spyOn(userService, 'findById').mockResolvedValue({ ...mockUser, isPaid: false } as any);

      await expect(service.uploadPhoto('expense-id', mockFile, 'user-id')).rejects.toThrow(
        new ForbiddenException(EXPENSE_ERROR.NOT_PAID_USER),
      );
    });

    it('should throw BadRequestException if no file provided', async () => {
      jest.spyOn(expensesModel, 'findById').mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockExpense),
      } as any);

      jest.spyOn(userService, 'findById').mockResolvedValue(mockUser as any);

      await expect(service.uploadPhoto('expense-id', null, 'user-id')).rejects.toThrow(
        new BadRequestException(EXPENSE_ERROR.NO_FILE_PROVIDED),
      );
    });

    it('should throw BadRequestException if file is not an image', async () => {
      jest.spyOn(expensesModel, 'findById').mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockExpense),
      } as any);

      jest.spyOn(userService, 'findById').mockResolvedValue(mockUser as any);

      const nonImageFile = { ...mockFile, mimetype: 'application/pdf' } as Express.Multer.File;

      await expect(service.uploadPhoto('expense-id', nonImageFile, 'user-id')).rejects.toThrow(
        new BadRequestException(EXPENSE_ERROR.FILE_NOT_IMAGE),
      );
    });

    it('should upload photo and update expense successfully', async () => {
      jest.spyOn(expensesModel, 'findById').mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockExpense),
      } as any);

      jest.spyOn(userService, 'findById').mockResolvedValue(mockUser as any);
      jest.spyOn(utilsService, 'convertToWebP').mockResolvedValue(Buffer.from('compressed'));
      jest.spyOn(cloudinaryService, 'uploadImage').mockResolvedValue(mockCloudinaryResponse as any);

      jest.spyOn(expensesModel, 'findByIdAndUpdate').mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          ...mockExpense,
          photo: mockCloudinaryResponse.secure_url,
        }),
      } as any);

      const result = await service.uploadPhoto('expense-id', mockFile, 'user-id');

      expect(utilsService.convertToWebP).toHaveBeenCalledWith(mockFile.buffer);
      expect(cloudinaryService.uploadImage).toHaveBeenCalledWith(Buffer.from('compressed'));
      expect(expensesModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'expense-id',
        { photo: mockCloudinaryResponse.secure_url },
        { new: true },
      );
      expect(result).toEqual({
        ...mockExpense,
        photo: mockCloudinaryResponse.secure_url,
      });
    });

    it('should throw HttpException if upload fails', async () => {
      jest.spyOn(expensesModel, 'findById').mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockExpense),
      } as any);

      jest.spyOn(userService, 'findById').mockResolvedValue(mockUser as any);
      jest.spyOn(utilsService, 'convertToWebP').mockResolvedValue(Buffer.from('compressed'));
      jest.spyOn(cloudinaryService, 'uploadImage').mockRejectedValue(new Error('Upload failed'));

      await expect(service.uploadPhoto('expense-id', mockFile, 'user-id')).rejects.toThrow(
        new HttpException(EXPENSE_ERROR.UPLOAD_PHOTO_ERROR, 500),
      );
    });
  });
});