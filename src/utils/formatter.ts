import { Injectable } from '@nestjs/common';

@Injectable()
export class Formatter {
  constructor() {}
  capitalizeString(word: string): string {
    if (!word) {
      return '';
    }
    const words = word.split(' ');

    const capitalizedWords = words.map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });

    return capitalizedWords.join(' ');
  }
}
