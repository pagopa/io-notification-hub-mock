import * as nodemailer from "nodemailer";

// eslint-disable-next-line import/no-internal-modules
import SMTPTransport = require("nodemailer/lib/smtp-transport");

export default class EmailService {
  private transporter: nodemailer.Transporter;
  public constructor(
    transporterConfig: SMTPTransport.Options,
    defaults: SMTPTransport.Options
  ) {
    this.transporter = nodemailer.createTransport(transporterConfig, defaults);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public send(mailOptions: nodemailer.SendMailOptions): Promise<any> {
    return this.transporter.sendMail(mailOptions);
  }

  public verifyTransport(): Promise<true> {
    return this.transporter.verify();
  }
}
