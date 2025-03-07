import { Test, TestingModule } from '@nestjs/testing';
import { PostponedExpenseController } from './postponed-expense.controller';
import { PostponedExpenseService } from './postponed-expense.service';
import { CURRENCIES } from '../../common/interfaces/currencies.enum';

describe('PostponedExpenseController', () => {
  let controller: PostponedExpenseController;

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
  };

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostponedExpenseController],
      providers: [
        {
          provide: PostponedExpenseService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<PostponedExpenseController>(PostponedExpenseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a postponed expense', async () => {
      const createDto = {
        amount: 100,
        categoryId: 'category-id',
        paymentSourceId: 'source-id',
        currency: CURRENCIES.USD,
        scheduledDate: new Date('2024-12-31'),
      };

      const req = { user: { userId: 'user-id' } };

      mockService.create.mockResolvedValue(mockPostponedExpense);

      const result = await controller.create(createDto, req);

      expect(result).toEqual(mockPostponedExpense);
      expect(mockService.create).toHaveBeenCalledWith(createDto, 'user-id');
    });
  });

  describe('findAll', () => {
    it('should return all postponed expenses', async () => {
      const req = { user: { userId: 'user-id' } };

      mockService.findAll.mockResolvedValue([mockPostponedExpense]);

      const result = await controller.findAll(req);

      expect(result).toEqual([mockPostponedExpense]);
      expect(mockService.findAll).toHaveBeenCalledWith('user-id');
    });
  });

  describe('findOne', () => {
    it('should return a specific postponed expense', async () => {
      const req = { user: { userId: 'user-id' } };

      mockService.findOne.mockResolvedValue(mockPostponedExpense);

      const result = await controller.findOne('test-id', req);

      expect(result).toEqual(mockPostponedExpense);
      expect(mockService.findOne).toHaveBeenCalledWith('test-id', 'user-id');
    });
  });

  describe('update', () => {
    it('should update a postponed expense', async () => {
      const updateDto = {
        amount: 200,
        categoryId: 'category-id',
        paymentSourceId: 'source-id',
        currency: CURRENCIES.EUR,
        scheduledDate: new Date('2024-12-31'),
      };

      const req = { user: { userId: 'user-id' } };

      mockService.update.mockResolvedValue({ ...mockPostponedExpense, ...updateDto });

      const result = await controller.update('test-id', updateDto, req);

      expect(result.amount).toBe(updateDto.amount);
      expect(result.currency).toBe(updateDto.currency);
      expect(mockService.update).toHaveBeenCalledWith('test-id', updateDto, 'user-id');
    });
  });

  describe('remove', () => {
    it('should remove a postponed expense', async () => {
      const req = { user: { userId: 'user-id' } };

      mockService.remove.mockResolvedValue(mockPostponedExpense);

      const result = await controller.remove('test-id', req);

      expect(result).toEqual(mockPostponedExpense);
      expect(mockService.remove).toHaveBeenCalledWith('test-id', 'user-id');
    });
  });
});
