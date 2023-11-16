import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsIP } from 'class-validator';

export class TracesRequest {
  @ApiProperty({
    example: '190.193.93.69',
    description: 'IP Address',
    nullable: false,
  })
  @IsNotEmpty()
  @IsIP()
  ip: string;
}
