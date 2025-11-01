import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ExpenseInputDto } from './dto/expense-input.dto';
import { ExpenseQueryInputDto } from './dto/expense-query-input.dto';
import { ExpenseService } from './expense.service';
import { ReceiptAiService } from './receipt-ai.service';
import { SharedExpenseDto } from './dto/get-shared-input.dto';
import { AccessJwtGuard } from '../../guards/access-jwt.guard';
import { ApiTags } from '@nestjs/swagger';
import { GetExpenseSwDec } from './decorators/get-expense-sw.decorator';
import { CreateExpenseSwDec } from './decorators/create-expense-sw.decorator';
import { ExpenseOutputDto } from './dto/expense-output.dto';
import { CustomRequest } from '../../common/interfaces/token.interface';
import { ValidMongoIdInParamsDec } from '../../common/decorators/valid-mongo-id.decorator';
import { GetExpenseByIdSwDec } from './decorators/get-expense-by-id-sw.decorator';
import { GetSharedSwDec } from './decorators/get-shared-expense-sw.decorator';
import { UpdateExpenseSwDec } from './decorators/update-expense-sw.decorator';
import { DeleteExpenseSwDec } from './decorators/delete-expense-sw.decorator';
import { GetExpenseByIdsSwDec } from './decorators/get-expense-by-ids-sw.decorator';
import { GetByCategorySwDec } from './decorators/get-expense-by-category-sw.decorator';
import { GetByPaymentSourceSwDec } from './decorators/get-expense-by-ps-sw.decorator';
import { GetExpenseByFamilyBudgetSwDec } from './decorators/get-expense-by-family-budget-id-se.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { ReceiptParseResponseDto } from './dto/receipt-expense-response.dto';
import { ParseReceiptSwDec } from './decorators/parse-receipt-sw.decorator';

@UseGuards(AccessJwtGuard)
@ApiTags('Expense')
@Controller('expense')
export class ExpenseController {
  constructor(
    private readonly expenseService: ExpenseService,
    private readonly receiptAiService: ReceiptAiService,
  ) {}

  @GetExpenseSwDec()
  @Get()
  async getOwn(@Query() queryInputDto: ExpenseQueryInputDto, @Req() req: CustomRequest): Promise<ExpenseOutputDto[]> {
    return this.expenseService.getOwn(req.user.userId, queryInputDto);
  }

  @GetExpenseByIdSwDec()
  @Get(':expenseId')
  async getById(
    @ValidMongoIdInParamsDec({ param: 'expenseId' }) expenseId: string,
    @Req() req: CustomRequest,
  ): Promise<ExpenseOutputDto> {
    return this.expenseService.getById(expenseId, req.user.userId);
  }

  @GetExpenseByIdsSwDec()
  @Post('bulk')
  async getBulk(@Body() expenseIds: string[], @Req() req: CustomRequest): Promise<ExpenseOutputDto[]> {
    return this.expenseService.getBulk(expenseIds, req.user.userId);
  }

  @GetByCategorySwDec()
  @Get('category/:categoryId')
  async getByCategory(@Param('categoryId') categoryId: string, @Req() req: CustomRequest): Promise<ExpenseOutputDto[]> {
    return this.expenseService.getByCategory(categoryId, req.user.userId);
  }

  @GetByPaymentSourceSwDec()
  @Get('payment-source/:paymentSourceId')
  async getByPaymentSource(
    @Param('paymentSourceId') paymentSourceId: string,
    @Req() req: CustomRequest,
  ): Promise<ExpenseOutputDto[]> {
    return this.expenseService.getByPaymentSource(paymentSourceId, req.user.userId);
  }

  @GetSharedSwDec()
  @Get('shared/:sharedId')
  async getShared(@Param() { sharedId }: SharedExpenseDto, @Req() req: CustomRequest) {
    return this.expenseService.getSharedExpenses(sharedId, req.user.userId);
  }

  @CreateExpenseSwDec()
  @Post()
  async create(@Body() inputDto: ExpenseInputDto, @Req() req: CustomRequest): Promise<ExpenseOutputDto> {
    return this.expenseService.create(inputDto, req.user.userId);
  }

  @UpdateExpenseSwDec()
  @Put(':expenseId')
  async update(
    @ValidMongoIdInParamsDec({ param: 'expenseId' }) expenseId: string,
    @Body() inputDto: ExpenseInputDto,
    @Req() req: CustomRequest,
  ): Promise<ExpenseOutputDto> {
    return this.expenseService.update(expenseId, inputDto, req.user.userId);
  }

  @DeleteExpenseSwDec()
  @Delete(':expenseId')
  async delete(
    @ValidMongoIdInParamsDec({ param: 'expenseId' }) expenseId: string,
    @Req() req: CustomRequest,
  ): Promise<ExpenseOutputDto> {
    return this.expenseService.delete(expenseId, req.user.userId);
  }

  @GetExpenseByFamilyBudgetSwDec()
  @Get('family-budget/:familyBudgetId')
  async getByFamilyBudget(
    @Param('familyBudgetId') familyBudgetId: string,
    @Req() req: CustomRequest,
  ): Promise<ExpenseOutputDto[]> {
    return this.expenseService.getExpensesByFamilyBudgetId(familyBudgetId, req.user.userId);
  }

  @Post('receipt/parse')
  @ParseReceiptSwDec()
  @UseInterceptors(FileInterceptor('receipt'))
  async parseReceipt(
    @UploadedFile() receipt: Express.Multer.File,
    @Req() req: CustomRequest,
  ): Promise<ReceiptParseResponseDto> {
    const { expenseInput, reason } = await this.receiptAiService.parseReceipt({
      image: receipt,
      userId: req.user.userId,
    });

    const expense = await this.expenseService.create(expenseInput, req.user.userId);

    return {
      expense,
      reason: reason ?? null,
    };
  }
}
