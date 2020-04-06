import * as fs from "fs";
import app from "./app";
import { log } from "./utils/logger";

// read package.json to print some info
const packageJson = JSON.parse(fs.readFileSync("./package.json").toString());

const server = app.listen(app.get("port"), () => {
  log.info(
    `${packageJson.name} is running on http://localhost:${app.get("port")}`
  );
  log.info("  Press CTRL-C to stop\n");
});

export default server;
