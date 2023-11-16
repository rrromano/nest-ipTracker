import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DistanceToUsa {
  constructor(private configService: ConfigService) {}
  calculateDistanceToUsa(lat: number, lon: number): number {
    const usaLat: number = this.configService.get<number>('appConfig.usaLat');
    const usaLon: number = this.configService.get<number>('appConfig.usaLon');

    const R = 6371; // Earth radius in kilometers
    const radianLat = this.deg2rad(lat - usaLat);
    const radianLon = this.deg2rad(lon - usaLon);
    const a =
      Math.sin(radianLat / 2) * Math.sin(radianLat / 2) +
      Math.cos(this.deg2rad(usaLat)) *
        Math.cos(this.deg2rad(lat)) *
        Math.sin(radianLon / 2) *
        Math.sin(radianLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceToUsa = R * c;
    return Number(distanceToUsa.toFixed(2));
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
