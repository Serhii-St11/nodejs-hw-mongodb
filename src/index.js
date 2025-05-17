import { config } from 'dotenv';
import { initDatabaseConnection } from './initMongoConnection.js';
import { setupServer } from './server.js';

config();

async function start() {
  await initDatabaseConnection();
  setupServer();
}

start();
