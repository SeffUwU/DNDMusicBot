import { config } from 'dotenv';

config();

export const AppConfig = {
  token: process.env.token as string,
};
