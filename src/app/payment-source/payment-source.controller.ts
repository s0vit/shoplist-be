import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaymentSourceService } from './payment-source.service';
import { PaymentSourceInputDto } from './dto/payment-source-input.dto';
import { AccessJwtGuard } from '../../guards/access-jwt.guard';
import { CreatePaymentSourceSwDec } from './decorators/create-payment-source-sw.decorator';
import { DeletePaymentSourceSwDec } from './decorators/delete-payment-source-sw.decorator';
import { GetAllPaymentSourceSwDec } from './decorators/get-all-payment-source-sw.decorator';
import { GetByIdPaymentSourceSwDec } from './decorators/get-by-id-payment-source-sw.decorator';
import { UpdatePaymentSourceSwDec } from './decorators/update-payment-source-sw.decorator';
import { PaymentSourceOutputDto } from './dto/payment-source-output.dto';
import { CustomRequest } from '../../common/interfaces/token.interface';

@ApiTags('Payment source')
@Controller('payment-source')
@UseGuards(AccessJwtGuard)
export class PaymentSourceController {
  constructor(private readonly paymentSourceService: PaymentSourceService) {}
  @CreatePaymentSourceSwDec()
  @Post()
  async create(@Body() inputDTO: PaymentSourceInputDto, @Req() req: CustomRequest): Promise<PaymentSourceOutputDto> {
    return this.paymentSourceService.create(req.user.userId, inputDTO);
  }

  @DeletePaymentSourceSwDec()
  @Delete(':id')
  // ToDo: No id verification
  async delete(@Param('id') id: string, @Req() req: CustomRequest): Promise<PaymentSourceOutputDto> {
    return this.paymentSourceService.delete(id, req.user.userId);
  }

  @GetByIdPaymentSourceSwDec()
  @Get(':id')
  // ToDo: No id verification
  async getOne(@Param('id') id: string, @Req() req: CustomRequest): Promise<PaymentSourceOutputDto> {
    return this.paymentSourceService.getOne(id, req.user.userId);
  }

  @GetAllPaymentSourceSwDec()
  @Get()
  async getAll(@Req() req: CustomRequest): Promise<PaymentSourceOutputDto[]> {
    return this.paymentSourceService.getAll(req.user.userId);
  }

  @UpdatePaymentSourceSwDec()
  @Put(':id')
  async update(
    // ToDo: No id verification
    @Param('id') id: string,
    @Body() inputDTO: PaymentSourceInputDto,
    @Req() req: CustomRequest,
  ): Promise<PaymentSourceOutputDto> {
    return this.paymentSourceService.update(id, inputDTO, req.user.userId);
  }
}
