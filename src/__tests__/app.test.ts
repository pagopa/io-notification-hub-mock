import { Express } from "express";
import * as request from "supertest";
import newApp from "../app";
import EmailService from "../services/emailService";

const mockSendEmail = jest.fn();
jest.mock("../services/emailService", () => ({
  default: jest.fn().mockImplementation(() => ({
    send: mockSendEmail
  }))
}));

const emailService = new EmailService(
  {
    auth: {
      pass: "password",
      user: "user"
    },
    host: "host",
    port: 0,
    secure: false
  },
  {
    from: "test@example.com",
    to: "test@example.com"
  }
);

describe("app", () => {
  // eslint-disable-next-line functional/no-let
  let app: Express;
  beforeAll(async () => {
    app = (await newApp(emailService).run()).mapLeft(fail).value;
  });

  describe("POST messages endpoint", () => {
    const endpoint = "/notificationHub/messages";
    it("should return a 400 error response when the request body is malformed", () => {
      request(app)
        .post(endpoint)
        .send({ prop: 123 })
        .expect(400);
    });

    it("should return a 413 error response when the request body is too large", () => {
      request(app)
        .post(endpoint)
        .send({
          prop: Array(10000000)
            .fill("x")
            .join("")
        })
        .expect(413);
    });

    it("should return a 200 success response", () => {
      request(app)
        .post(endpoint)
        .send({ prop: "value" })
        .expect(200);
    });
  });

  describe("PUT installations endpoint", () => {
    const endpoint = "/notificationHub/installations/id";
    it("should return a 400 error response when the request body is malformed", () => {
      return request(app)
        .put(endpoint)
        .send({
          installationId: 123,
          platform: true
        })
        .expect(400);
    });

    it("should return a 200 success response", () => {
      return request(app)
        .put(endpoint)
        .send({
          installationId: "id",
          platform: "android",
          pushChannel: "channel"
        })
        .expect(200);
    });
  });

  describe.skip("DELETE installations endpoint", () => {
    const endpoint = "/notificationHub/installations";

    it("should return a 204 success response", () => {
      return request(app)
        .delete(endpoint + "/id")
        .expect(204);
    });
  });
});
