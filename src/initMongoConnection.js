import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export async function initDatabaseConnection() {
  const { MONGODB_USER, USER_PASSWORD, MONGODB_URL, MONGODB_DB } = process.env;
  const DB_URI = `mongodb+srv://${MONGODB_USER}:${USER_PASSWORD}@${MONGODB_URL}/${MONGODB_DB}?retryWrites=true&w=majority`;

  try {
    await mongoose.connect(DB_URI);
    console.log('Mongo connection successfully established!');
  } catch (err) {
    console.error('Mongo connection failed:', err.message);
    process.exit(1);
  }
}
