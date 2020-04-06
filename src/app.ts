import * as bodyParser from "body-parser";
import * as express from "express";

// Create Express server
const app = express();

// Express configuration
app.set("port", process.env.PORT || 3000);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (_0, res) => {
  res.json({ text: "Hello world!" });
});

export default app;
