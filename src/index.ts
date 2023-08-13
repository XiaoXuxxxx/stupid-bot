import { ConfigContainer } from '@/src/ConfigContainer';
import StupidBot from '@/src/StupidBot';
import dotenv from 'dotenv';
dotenv.config();

const token = process.env.TOKEN;
if (!token) {
  throw new Error('No token provided');
}

new StupidBot(token, new ConfigContainer());
