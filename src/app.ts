import * as bodyParser from "body-parser";
import * as express from "express";
import { Express } from "express";
import { toError } from "fp-ts/lib/Either";
import { tryCatch } from "fp-ts/lib/TaskEither";
import { Errors } from "io-ts";
import { errorsToReadableMessages } from "italia-ts-commons/lib/reporters";
import { CreateOrOverwriteInstallationBody } from "./generated/definitions/CreateOrOverwriteInstallationBody";
import { SendTemplateNotificationBody } from "./generated/definitions/SendTemplateNotificationBody";
import EmailService from "./services/emailService";
import { log } from "./utils/logger";
import { getRequestInfo } from "./utils/request";

export default function newApp(emailService: EmailService): Express {
  // Create Express server
  const app = express();

  // Express configuration
  app.set("port", process.env.PORT || 3000);
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.get("/", (_, res) => {
    res.json({ message: "The server is up and running" });
  });

  app.post(
    "/:notificationHub/messages",
    bodyParser.json({ limit: "64Kb" }),
    (req, res) => {
      const endpointInfo = "POST /:notificationHub/messages";
      const requestInfo = getRequestInfo(req);
      return SendTemplateNotificationBody.decode(req.body)
        .mapLeft(errors =>
          res.status(getMalformedRequestStatusCode(endpointInfo, errors)).end()
        )
        .map(() => {
          log.info(
            "[POST /:notificationHub/messages] Request body: %s",
            requestInfo
          );
          res.status(200).end();
          return tryCatch(
            () =>
              emailService.send({
                html: `<pre>${requestInfo}</pre>`,
                subject: `[${endpointInfo}]`,
                text: requestInfo
              }),
            toError
          )
            .mapLeft(error => {
              log.error(`[${endpointInfo}] %s`, error);
            })
            .run();
        });
    }
  );

  app.put("/:notificationHub/installations", (req, res) => {
    const endpointInfo = "PUT /:notificationHub/installations";
    const requestInfo = getRequestInfo(req);
    log.info(`[${endpointInfo}] Request info: %s`, requestInfo);
    res
      .status(
        CreateOrOverwriteInstallationBody.decode(req.body).fold(
          errors => getMalformedRequestStatusCode(endpointInfo, errors),
          () => 200
        )
      )
      .end();
  });

  app.delete("/:notificationHub/installations/:installationId", (_, res) =>
    res.status(204).end()
  );

  return app;
}

function getMalformedRequestStatusCode(
  endpointInfo: string,
  errors: Errors
): number {
  log.info(
    `${endpointInfo}Invalid payload. %s`,
    errorsToReadableMessages(errors).join(" / ")
  );
  return 400;
}
