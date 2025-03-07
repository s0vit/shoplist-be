import { Test, TestingModule } from '@nestjs/testing';
import { PostponedExpenseService } from './postponed-expense.service';
import { getModelToken } from '@nestjs/mongoose';
import { ExpenseService } from '../expense/expense.service';
import { CurrencyService } from '../currency/currency.service';
import { PostponedExpense } from './models/postponed-expense.model';
import { Model } from 'mongoose';
import { CURRENCIES } from '../../common/interfaces/currencies.enum';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';

describe('PostponedExpenseService', () => {
  let service: PostponedExpenseService;
  let model: Model<PostponedExpense>;

  const mockPostponedExpense = {
    _id: 'test-id',
    userId: 'user-id',
    amount: 100,
    categoryId: 'category-id',
    paymentSourceId: 'source-id',
    currency: CURRENCIES.USD,
    scheduledDate: new Date('2024-12-31'),
    isProcessed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    processedExchangeRates: null,
  };

  class MockModel {
    constructor(private data: any) {
      Object.assign(this, data);
    }

    save = jest.fn().mockResolvedValue(mockPostponedExpense);
    static find = jest.fn();
    static findById = jest.fn();
    static findByIdAndUpdate = jest.fn();
  }

  const mockExpenseService = {
    create: jest.fn(),
  };

  const mockCurrencyService = {
    getRatesByDate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostponedExpenseService,
        {
          provide: getModelToken(PostponedExpense.name),
          useValue: MockModel,
        },
        {
          provide: ExpenseService,
          useValue: mockExpenseService,
        },
        {
          provide: CurrencyService,
          useValue: mockCurrencyService,
        },
      ],
    }).compile();

    service = module.get<PostponedExpenseService>(PostponedExpenseService);
    model = module.get<Model<PostponedExpense>>(getModelToken(PostponedExpense.name));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a postponed expense', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const createDto = {
        amount: 100,
        categoryId: 'category-id',
        paymentSourceId: 'source-id',
        currency: CURRENCIES.USD,
        scheduledDate: futureDate,
      };

      const result = await service.create(createDto, 'user-id');

      expect(result).toEqual(mockPostponedExpense);
    });

    it('should throw error if scheduled date is not in future', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const createDto = {
        amount: 100,
        categoryId: 'category-id',
        paymentSourceId: 'source-id',
        currency: CURRENCIES.USD,
        scheduledDate: pastDate,
      };

      await expect(service.create(createDto, 'user-id')).rejects.toThrow('Scheduled date must be in the future');
    });
  });

  describe('findAll', () => {
    it('should return all unprocessed postponed expenses for user', async () => {
      const mockSort = jest.fn().mockReturnThis();
      const mockExec = jest.fn().mockResolvedValue([mockPostponedExpense]);

      jest.spyOn(model, 'find').mockImplementation(
        () =>
          ({
            sort: mockSort,
            exec: mockExec,
          }) as any,
      );

      const result = await service.findAll('user-id');

      expect(result).toEqual([mockPostponedExpense]);
      expect(model.find).toHaveBeenCalledWith({ userId: 'user-id', isProcessed: false });
    });
  });

  describe('findOne', () => {
    it('should return a specific postponed expense', async () => {
      jest.spyOn(model, 'findById').mockResolvedValue(mockPostponedExpense);

      const result = await service.findOne('test-id', 'user-id');

      expect(result).toEqual(mockPostponedExpense);
    });

    it('should throw NotFoundException if expense not found', async () => {
      jest.spyOn(model, 'findById').mockResolvedValue(null);

      await expect(service.findOne('test-id', 'user-id')).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException if user does not own the expense', async () => {
      jest.spyOn(model, 'findById').mockResolvedValue(mockPostponedExpense);

      await expect(service.findOne('test-id', 'wrong-user-id')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('update', () => {
    it('should update a postponed expense', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const updateDto = {
        amount: 200,
        categoryId: 'category-id',
        paymentSourceId: 'source-id',
        currency: CURRENCIES.EUR,
        scheduledDate: futureDate,
      };

      const updatedExpense = { ...mockPostponedExpense, ...updateDto };
      const mockSave = jest.fn().mockResolvedValue(updatedExpense);

      jest.spyOn(model, 'findById').mockResolvedValue({
        ...mockPostponedExpense,
        save: mockSave,
      });

      const result = await service.update('test-id', updateDto, 'user-id');

      expect(result.amount).toBe(updateDto.amount);
      expect(result.currency).toBe(updateDto.currency);
      expect(mockSave).toHaveBeenCalled();
    });

    it('should throw error if trying to update processed expense', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const updateDto = {
        amount: 200,
        categoryId: 'category-id',
        paymentSourceId: 'source-id',
        currency: CURRENCIES.EUR,
        scheduledDate: futureDate,
      };

      jest.spyOn(model, 'findById').mockResolvedValue({
        ...mockPostponedExpense,
        isProcessed: true,
      });

      await expect(service.update('test-id', updateDto, 'user-id')).rejects.toThrow('Cannot update processed expense');
    });
  });

  describe('remove', () => {
    it('should delete a postponed expense', async () => {
      const mockDeleteOne = jest.fn().mockResolvedValue(undefined);
      const expenseToDelete = { ...mockPostponedExpense, deleteOne: mockDeleteOne };

      jest.spyOn(model, 'findById').mockResolvedValue(expenseToDelete);

      const result = await service.remove('test-id', 'user-id');

      expect(result).toEqual(expenseToDelete);
      expect(mockDeleteOne).toHaveBeenCalled();
    });

    it('should throw error if trying to delete processed expense', async () => {
      jest.spyOn(model, 'findById').mockResolvedValue({
        ...mockPostponedExpense,
        isProcessed: true,
      });

      await expect(service.remove('test-id', 'user-id')).rejects.toThrow('Cannot delete processed expense');
    });
  });

  describe('processScheduledExpenses', () => {
    it('should process scheduled expenses', async () => {
      const mockExpense = {
        ...mockPostponedExpense,
        save: jest.fn().mockImplementation(function (this: any) {
          return Promise.resolve(this);
        }),
      };

      jest.spyOn(model, 'find').mockResolvedValue([mockExpense]);

      mockCurrencyService.getRatesByDate.mockResolvedValue({ rates: { USD: 1, EUR: 0.85 } });
      mockExpenseService.create.mockResolvedValue({});

      await service.processScheduledExpenses();

      expect(mockExpenseService.create).toHaveBeenCalled();
      expect(mockCurrencyService.getRatesByDate).toHaveBeenCalled();
      expect(mockExpense.save).toHaveBeenCalled();
      expect(mockExpense.isProcessed).toBe(true);
      expect(mockExpense.processedExchangeRates).toEqual({ USD: 1, EUR: 0.85 });
    });
  });
});
