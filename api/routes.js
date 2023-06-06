import { authRouter } from "./routes/auth.js";
import { projectsRouter } from "./routes/projects.js";
import { recordsRouter } from "./routes/records.js";

export default function useRoutes(app) {
  app.use("/auth", authRouter);
  app.use("/record", recordsRouter);
  app.use("/project", projectsRouter);
}