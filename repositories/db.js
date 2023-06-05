import { dbConfig } from './../config.js';
import knex from 'knex';

const db = knex(dbConfig);

export { db };