import express from "express";
import { serverConfig as config } from "./config.js";
import useRoutes from "./api/routes.js";

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello world!');
});

useRoutes(app);

app.listen(config.port, async () => {
  console.log(`Server is running at http://localhost:${config.port}`);
});