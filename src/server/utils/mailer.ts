import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import handlebars from "handlebars";

const NODEMAILER_G_APP = process.env.NODEMAILER_G_APP;

type User = {
  name?: string;
  phone?: string;
  number?: number;
  startDate?: string;
  endDate?: string;
  pickupHour?: string;
  email: string;
  equipmentList?: { item: string; quantity: string }[];
};

export const sendMail = async (user: User, templateName: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "hola@guanacorental.com",
      pass: NODEMAILER_G_APP,
    },
  });

  const templateSource = fs.readFileSync(
    path.resolve(process.cwd() + `/src/server/utils/templates/${templateName}`),
    "utf-8"
  );

  const template = handlebars.compile(templateSource);

  const mailOptions = {
    from: "Guanaco Rental hola@guanacorental.com",
    to: user.email,
    subject: "FOMRULARIO DE ALTA GUANACO RENTAL",
    html: template(user),
  };

  const mail = await transporter.sendMail(mailOptions);
  return mail;
};