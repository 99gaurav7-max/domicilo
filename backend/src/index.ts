import app from './app';
import { config } from './config';
import { pool } from './config/database';

async function start() {
  try {
    await pool.query('SELECT 1');
    console.log('Database pool warmed up — connection established');
  } catch (err) {
    console.warn('Database warm-up failed, server will start anyway:', (err as Error).message);
  }

  app.listen(config.port, () => {
    console.log(`Domicilo API running on port ${config.port} in ${config.nodeEnv} mode`);
  });
}

start();
