import dotenv from 'dotenv';

dotenv.config();

const serverConfig = {
  port: process.env.SERVER_PORT
};

const dbConfig = { 
  client: process.env.DATABASE_CLIENT,
  connection: {
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME
  }
}

export { serverConfig, dbConfig }