import express from "express";
import { serverConfig as config } from "./config.js";
import * as db from "./db.js";

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello world!');
})

app.listen(config.port, async () => {
  console.log((await db.unpublishRecord('99f2a780-fa10-4393-8ac4-84dff9b9f5c0')));
  console.log(`Server is running at http://localhost:${config.port}`);
});