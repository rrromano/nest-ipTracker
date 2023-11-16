import { ApiProperty } from '@nestjs/swagger';

export class Currency {
  @ApiProperty({ example: 'ARS', description: 'ISO code' })
  iso: string;

  @ApiProperty({ example: '$', description: 'Symbol' })
  symbol: string;

  @ApiProperty({
    example: '0.00286',
    description: 'Conversion rate from currency to USD',
  })
  conversion_rate: number;
}

export class Traces {
  @ApiProperty({ example: '190.193.93.69', description: 'IP Address' })
  ip: string;

  @ApiProperty({ example: 'Argentina', description: 'Country Name' })
  name: string;

  @ApiProperty({ example: 'AR', description: 'Country Code' })
  code: string;

  @ApiProperty({ example: '-34.674', description: 'Latitude' })
  lat: number;

  @ApiProperty({ example: '-58.7473', description: 'Longitude' })
  lon: number;

  @ApiProperty({ type: Currency, isArray: true })
  currencies: Currency[];

  @ApiProperty({
    example: '8847.57',
    description:
      'Distance between United States and country of origin (in Kilometers)',
  })
  distance_to_usa: number;
}
