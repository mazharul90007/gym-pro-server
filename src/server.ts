import mongoose from 'mongoose';
import config from './app/config';
import app from './app';

async function main() {
  try {
    await mongoose.connect(config.db_uri as string);

    app.listen(config.port, () => {
      console.log(`Gym-Pro is running on port ${config.port}`);
    });
  } catch (error) {
    console.log(error);
  }
}

main();
