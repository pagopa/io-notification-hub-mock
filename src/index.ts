import { toError } from "fp-ts/lib/Either";
import { tryCatch } from "fp-ts/lib/TaskEither";
import * as fs from "fs";
import newApp from "./app";
import EmailService from "./services/emailService";
import { getRequiredEnvVar, readFile } from "./utils/environment";
import { log } from "./utils/logger";
import * as https from "https";

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

tryCatch(() => emailService.verifyTransport(), toError)
  .mapLeft(error => {
    log.error("Error on email service init. %s", error);
    process.exit(1);
  })
  .chain(() =>
    newApp(emailService)
      .map(app => {
        const options = { key: readFile(
          process.env.HTTPS_KEY_PATH || "./certs/key.pem",
          "HTTPS certificate"
        ), cert: readFile(
          process.env.HTTPS_CERT_PATH || "./certs/cert.pem",
          "HTTPS certificate"
        ) };
        https.createServer(options, app).listen(443, () => {
          log.info(
            `${packageJson.name} is running on http://localhost:${app.get(
              "port"
            )}`
          );
        })
      })
      .mapLeft(error => {
        log.error("Error on app init. %s", error);
        process.exit(1);
      })
  )
  // tslint:disable-next-line:no-floating-promises
  .run();
