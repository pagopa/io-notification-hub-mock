import * as fs from "fs";
import * as https from "https";
import { toError } from "fp-ts/lib/Either";
import { tryCatch } from "fp-ts/lib/TaskEither";
import newApp from "./app";
import EmailService from "./services/emailService";
import { getRequiredEnvVar, readFile } from "./utils/environment";
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

// eslint-disable-next-line @typescript-eslint/no-floating-promises
tryCatch(() => emailService.verifyTransport(), toError)
  .mapLeft(error => {
    log.error("Error on email service init. %s", error);
    process.exit(1);
  })
  .chain(() =>
    newApp(emailService)
      .map(app => {
        const options = {
          cert: readFile(
            process.env.HTTPS_CERT_PATH || "./certs/cert.pem",
            "HTTPS certificate"
          ),
          key: readFile(
            process.env.HTTPS_KEY_PATH || "./certs/key.pem",
            "HTTPS certificate"
          )
        };
        https
          .createServer(options, app)
          .listen(process.env.PORT || 3000, () => {
            log.info(
              `${packageJson.name} is running on http://localhost:${app.get(
                "port"
              )}`
            );
          });
      })
      .mapLeft(error => {
        log.error("Error on app init. %s", error);
        process.exit(1);
      })
  )
  .run();
