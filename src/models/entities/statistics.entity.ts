import { ApiProperty } from '@nestjs/swagger';

class LongestDistance {
  @ApiProperty({
    example: 'Thailand',
    description: 'Country Name with the longest distance to the USA',
  })
  country: string;

  @ApiProperty({ example: '14094.72', description: 'Distance in Kilometers' })
  value: number;
}

class MostTraced {
  @ApiProperty({
    example: 'Argentina',
    description: 'Country Name with the most traces',
  })
  country: string;

  @ApiProperty({ example: '4', description: 'Count of traces' })
  value: number;
}

export class Statistics {
  @ApiProperty({ type: LongestDistance })
  longest_distance: LongestDistance;

  @ApiProperty({ type: MostTraced })
  most_traced: MostTraced;
}
