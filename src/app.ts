import * as bodyParser from "body-parser";
import * as express from "express";
import { Errors } from "io-ts";
import { errorsToReadableMessages } from "italia-ts-commons/lib/reporters";
import { CreateOrOverwriteInstallationBody } from "./generated/definitions/CreateOrOverwriteInstallationBody";
import { SendTemplateNotificationBody } from "./generated/definitions/SendTemplateNotificationBody";
import { log } from "./utils/logger";

// Create Express server
const app = express();

// Express configuration
app.set("port", process.env.PORT || 3000);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (_0, res) => {
  res.json({ message: "The server is up and running" });
});

app.post(
  "/:notificationHub/messages",
  bodyParser.json({ limit: "64Kb" }),
  (req, res) =>
    res
      .status(
        SendTemplateNotificationBody.decode(req.body).fold(
          invalidPayloadHandler,
          () => 200
        )
      )
      .end()
);

app.put("/:notificationHub/installations", (req, res) =>
  res
    .status(
      CreateOrOverwriteInstallationBody.decode(req.body).fold(
        invalidPayloadHandler,
        () => 204
      )
    )
    .end()
);

app.delete("/:notificationHub/installations/:installationId", (_, res) =>
  res.status(204).end()
);

function invalidPayloadHandler(errors: Errors): number {
  log.info("Invalid payload. ", errorsToReadableMessages(errors).join(" / "));
  return 400;
}

export default app;
