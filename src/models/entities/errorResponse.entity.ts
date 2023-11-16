import { ApiProperty } from '@nestjs/swagger';

class ErrorResponseDetails {
  @ApiProperty({ example: 'Error', description: 'Code Error' })
  code: string;

  @ApiProperty({
    example: 'Stack Error',
    description: 'Stack Error Description',
  })
  stack: string;

  @ApiProperty({
    example: '2023-11-13T22:55:34.136Z',
    description: 'Error TimeStamp',
  })
  timestamp: string;
}

export class ErrorResponse {
  @ApiProperty({ example: 'XXX', description: 'HTTP Status Code' })
  statusCode: number;

  @ApiProperty({ example: 'Message Error', description: 'Description Error' })
  message: string;

  @ApiProperty({
    type: ErrorResponseDetails,
  })
  error: ErrorResponseDetails;
}
