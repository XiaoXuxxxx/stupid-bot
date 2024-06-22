import dotenv from 'dotenv';

import { ConfigContainer } from '@/src/ConfigContainer';
import StupidBot from '@/src/StupidBot';

dotenv.config();

const token = process.env.TOKEN;
if (!token) {
  throw new Error('No token provided');
}

new StupidBot(token, new ConfigContainer());
