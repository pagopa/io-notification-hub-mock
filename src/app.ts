import * as bodyParser from "body-parser";
import * as express from "express";
import { Express } from "express";
import { toError } from "fp-ts/lib/Either";
import { fromEither, TaskEither, tryCatch } from "fp-ts/lib/TaskEither";
import { Errors } from "io-ts";
import { errorsToReadableMessages } from "italia-ts-commons/lib/reporters";
import * as low from "lowdb";
import { LowdbAsync } from "lowdb";
// tslint:disable-next-line:no-submodule-imports
import * as FileAsync from "lowdb/adapters/FileAsync";
import { CreateOrOverwriteInstallationBody } from "./generated/definitions/CreateOrOverwriteInstallationBody";
import { SendTemplateNotificationBody } from "./generated/definitions/SendTemplateNotificationBody";
import EmailService from "./services/emailService";
import { getRequiredEnvVar } from "./utils/environment";
import { log } from "./utils/logger";
import { getRequestInfo } from "./utils/request";

interface IDbSchema {
  installations: ReadonlyArray<CreateOrOverwriteInstallationBody>;
}

export default function newApp(
  emailService: EmailService
): TaskEither<Error, Express> {
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
    // Message size cannot be over 64Kb,
    // see https://docs.microsoft.com/en-us/rest/api/notificationhubs/send-template-notification#response
    bodyParser.json({ limit: "64Kb" }),
    (req, res) => {
      const endpointInfo = `${req.url} ${req.method}`;
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

  return tryCatch(() => {
    const adapter = new FileAsync<IDbSchema>(getRequiredEnvVar("DB_SOURCE"));
    return low(adapter);
  }, toError)
    .chain(db =>
      tryCatch(() => db.defaults({ installations: [] }).write(), toError).map(
        () => db
      )
    )
    .map(db => registerInstallationsRoutes(app, db));
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

function registerInstallationsRoutes(
  app: Express,
  db: LowdbAsync<IDbSchema>
): Express {
  app.put("/:notificationHub/installations/:installationId", (req, res) => {
    const endpointInfo = `${req.url} ${req.method}`;
    const requestInfo = getRequestInfo(req);
    log.info(`[${endpointInfo}] Request info: %s`, requestInfo);
    return fromEither(CreateOrOverwriteInstallationBody.decode(req.body))
      .mapLeft<Error | void>(errors =>
        res.status(getMalformedRequestStatusCode(endpointInfo, errors)).end()
      )
      .chain(requestBody =>
        tryCatch(
          () =>
            db
              .get("installations")
              .remove(
                installation =>
                  installation.installationId === requestBody.installationId
              )
              .write(),
          toError
        ).map(() => requestBody)
      )
      .chain(requestBody =>
        tryCatch(
          () =>
            db
              .get("installations")
              .push(requestBody)
              .write(),
          toError
        )
      )
      .mapLeft(error => {
        log.error("An error occurred on db write. %s", error);
        return res.status(500).send();
      })
      .map(() => res.status(200).end())
      .run();
  });

  app.delete("/:notificationHub/installations/:installationId", (req, res) => {
    const endpointInfo = `${req.url} ${req.method}`;
    const requestInfo = getRequestInfo(req);
    log.info(`[${endpointInfo}] Request info: %s`, requestInfo);
    return tryCatch(
      () =>
        db
          .get("installations")
          .remove(
            installation =>
              installation.installationId === req.params.installationId
          )
          .write(),
      toError
    )
      .mapLeft(error => {
        log.error("An error occurred on db write. %s", error);
        return res.status(500).send();
      })
      .map(() => res.status(204).end())
      .run();
  });

  return app;
}
