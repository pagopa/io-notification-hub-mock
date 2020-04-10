import * as fs from "fs";
import newApp from "./app";
import EmailService from "./services/emailService";
import { getRequiredEnvVar } from "./utils/environment";
import { log } from "./utils/logger";

// read package.json to print some info
const packageJson = JSON.parse(fs.readFileSync("./package.json").toString());

const emailService = new EmailService(
  {
    auth: {
      pass: getRequiredEnvVar("EMAIL_PASSWORD"),
      user: getRequiredEnvVar("EMAIL_USER")
    },
    host: getRequiredEnvVar("EMAIL_SMTP_HOST"),
    port: Number(getRequiredEnvVar("EMAIL_SMTP_PORT")),
    secure: getRequiredEnvVar("EMAIL_SMTP_SECURE") === "true"
  },
  {
    from: getRequiredEnvVar("EMAIL_SENDER"),
    to: getRequiredEnvVar("EMAIL_RECIPIENT")
  }
);

emailService
  .verifyTransport()
  .then(() => {
    const app = newApp(emailService);

    return app.listen(app.get("port"), () => {
      log.info(
        `${packageJson.name} is running on http://localhost:${app.get("port")}`
      );
      log.info("  Press CTRL-C to stop\n");
    });
  })
  .catch(error => {
    log.error("Error on app init.", error);
    process.exit(1);
  });
