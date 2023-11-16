import { registerAs } from '@nestjs/config';

export default registerAs('currencyApiConfig', () => ({
  urlBase: process.env.CURRENCY_URL_BASE,
  urlCurrencies: process.env.CURRENCY_URL_CURRENCIES,
  urlLatestRate: process.env.CURRENCY_URL_LATEST_RATES,
  accessKey: process.env.CURRENCY_ACCESS_KEY,
}));
