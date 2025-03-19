import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';
import { ExpenseOutputDto } from '../dto/expense-output.dto';

export function UploadPhotoSwDec() {
  return applyDecorators(
    ApiOperation({
      summary: 'Upload receipt photo for an expense',
      description: `
        Requires:
        - token in the header
        - expenseId in Param
        - file in FormData

        This endpoint allows paid users to upload a photo of a receipt for an expense.
        The photo will be stored in Cloudinary and the URL will be saved in the expense record.
      `,
    }),
    ApiBearerAuth(),
    ApiConsumes('multipart/form-data'),
    ApiParam({
      name: 'expenseId',
      type: String,
      required: true,
      description: 'The expense id',
    }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          file: {
            type: 'string',
            format: 'binary',
            description: 'The receipt photo file',
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'The expense with the uploaded photo',
      type: ExpenseOutputDto,
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request: No file provided or file is not an image',
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized: User is not authenticated',
    }),
    ApiResponse({
      status: 403,
      description: 'Forbidden: User is not a paid user',
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found: Expense not found',
    }),
    ApiResponse({
      status: 500,
      description: 'Internal Server Error: Failed to upload photo',
    }),
  );
}