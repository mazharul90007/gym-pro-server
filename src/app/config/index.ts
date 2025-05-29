import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  port: process.env.PORT,
  db_uri: process.env.DB_URI,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  node_env: process.env.NODE_ENV,
  admin_max_schedules_per_day: process.env.ADMIN_MAX_SCHEDULES_PER_DAY
    ? parseInt(process.env.ADMIN_MAX_SCHEDULES_PER_DAY)
    : 5,
  jwt: {
    secret: process.env.JWT_SECRET,
    refresh_secret: process.env.JWT_REFRESH_SECRET,
    access_token_expires_in: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '1h',
    refresh_token_expires_in: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '7d',
  },
};
