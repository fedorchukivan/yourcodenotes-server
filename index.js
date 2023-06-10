import express from "express";
import { serverConfig as config } from "./config.js";
import useRoutes from "./api/routes.js";
import cors from 'cors';

const app = express();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello world!');
});

useRoutes(app);

app.listen(config.port, async () => {
  console.log(`Server is running at http://localhost:${config.port}`);
});