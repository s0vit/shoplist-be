import { Body, Controller, Delete, Param, Patch, Post } from '@nestjs/common';

@Controller('payment-sources')
export class PaymentSourcesController {
  @Post()
  async create(@Body('name') name: string) {}

  @Delete(':id')
  async delete(@Param('id') id: string) {}

  @Patch(':id')
  async update(@Param('id') id: string, @Body('name') name: string) {}
}
