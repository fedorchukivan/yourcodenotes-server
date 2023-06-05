import express from "express";
import { serverConfig as config } from "./config.js";

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello world!');
})

app.listen(config.port, async () => {
  console.log(`Server is running at http://localhost:${config.port}`);
});