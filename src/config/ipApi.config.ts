import { registerAs } from '@nestjs/config';

export default registerAs('ipApiConfig', () => ({
  urlBase: process.env.IP_API_URL_BASE,
  urlGeolocation: process.env.IP_API_URL_GEOLOCATION,
}));
