import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

const NODEMAILER_G_APP = process.env.NODEMAILER_G_APP;

export const sendMail = async (email: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "hola@guanacorental.com",
      pass: NODEMAILER_G_APP,
    },
  });

  function readHTMLFile() {
    const template = fs.readFileSync(
      path.resolve(
        process.cwd() + "/src/server/utils/templates/customerApproved.html"
      ),
      "utf-8"
    );
    return template;
  }

  const html = readHTMLFile();

  const mailOptions = {
    from: "Guanaco Rental hola@guanacorental.com",
    to: email,
    subject: "FOMRULARIO DE ALTA GUANACO RENTAL",
    html,
  };

  const mail = await transporter.sendMail(mailOptions);
  return mail;
};
