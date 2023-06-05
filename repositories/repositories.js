import AuthRepository from "./auth.js";
import { db } from "./db.js";
import ProjectsRepository from "./projects.js";
import RecordsRepository from "./records.js";

const authRepository = new AuthRepository(db);
const recordsRepository = new RecordsRepository(db);
const projectsRepository = new ProjectsRepository(db);

export {
  authRepository,
  recordsRepository,
  projectsRepository,
};