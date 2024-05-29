import { Body, Controller, Delete, Param, Patch, Post } from '@nestjs/common';

import { ApiTags } from '@nestjs/swagger';
@ApiTags('Payment sources')
@Controller('payment-sources')
export class PaymentSourcesController {
  @Post()
  async create(@Body('name') name: string) {
    return { name };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return { id };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body('name') name: string) {
    return { id, name };
  }
}
