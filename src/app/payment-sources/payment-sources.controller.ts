import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaymentSourcesService } from './payment-sources.service';
import { PaymentSourceInputDto } from './dto/payment-source-input.dto';
import { AccessJwtGuard } from '../../guards/access-jwt.guard';
import { CreatePaymentSourceSwaggerDecorator } from './decorators/create-payment-source-swagger.decorator';
import { DeletePaymentSourceSwaggerDecorator } from './decorators/delete-payment-source-swagger.decorator';
import { GetAllPaymentSourceSwaggerDecorator } from './decorators/get-all-payment-source-swagger.decorator';
import { GetByIdPaymentSourceSwaggerDecorator } from './decorators/get-by-id-payment-source-swagger.decorator';
import { UpdatePaymentSourceSwaggerDecorator } from './decorators/update-payment-source-swagger.decorator';
import { PaymentSourceOutputDto } from './dto/payment-source-output.dto';
import { CustomRequest } from '../../common/interfaces/token.interface';
import { IsUserVerifiedGuard } from '../../guards/is-user-verified-guard';

@ApiTags('Payment sources')
@Controller('payment-sources')
@UseGuards(AccessJwtGuard, IsUserVerifiedGuard)
export class PaymentSourcesController {
  constructor(private readonly paymentSourcesService: PaymentSourcesService) {}
  @CreatePaymentSourceSwaggerDecorator()
  @Post()
  async create(@Body() inputDTO: PaymentSourceInputDto, @Req() req: CustomRequest): Promise<PaymentSourceOutputDto> {
    return this.paymentSourcesService.create(req.user.userId, inputDTO);
  }

  @DeletePaymentSourceSwaggerDecorator()
  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: CustomRequest): Promise<PaymentSourceOutputDto> {
    return this.paymentSourcesService.delete(id, req.user.userId);
  }

  @GetByIdPaymentSourceSwaggerDecorator()
  @Get(':id')
  async getOne(@Param('id') id: string, @Req() req: CustomRequest): Promise<PaymentSourceOutputDto> {
    return this.paymentSourcesService.getOne(id, req.user.userId);
  }

  @GetAllPaymentSourceSwaggerDecorator()
  @Get()
  async getAll(@Req() req: CustomRequest): Promise<PaymentSourceOutputDto[]> {
    return this.paymentSourcesService.getAll(req.user.userId);
  }

  @UpdatePaymentSourceSwaggerDecorator()
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() inputDTO: PaymentSourceInputDto,
    @Req() req: CustomRequest,
  ): Promise<PaymentSourceOutputDto> {
    return this.paymentSourcesService.update(id, inputDTO, req.user.userId);
  }
}
