import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import Handlebars from "handlebars/runtime";

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
  total?: string;
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "hola@guanacorental.com",
    pass: NODEMAILER_G_APP,
  },
});

export const sendMail = async (user: User, templateName: string, subject: string) => {
  const templateSource = fs.readFileSync(
    path.resolve(process.cwd() + `/src/utils/handlebars/templates/${templateName}`),
    "utf-8"
  );

  const template = Handlebars.compile(templateSource);

  const mailOptions = {
    from: "Guanaco Rental hola@guanacorental.com",
    to: user.email,
    subject,
    html: template(user),
  };

  const mail = await transporter.sendMail(mailOptions);
  return mail;
};

export const sendMailToGuanaco = async (user: User, subject: string) => {
  const templateSource = fs.readFileSync(
    path.resolve(process.cwd() + `/src/utils/handlebars/templates/newOrder.handlebars`),
    "utf-8"
  );

  const template = Handlebars.compile(templateSource);

  const mailOptions = {
    from: "Guanaco Rental hola@guanacorental.com",
    to: "hola@guanacorental.com",
    subject,
    html: template(user),
  };

  const mail = await transporter.sendMail(mailOptions);
  return mail;
};

export const sendCancelOrderMail = async (email: string, orderNumber: number) => {
  const templateSource = fs.readFileSync(
    path.resolve(process.cwd() + `/src/utils/handlebars/templates/orderCanceled.handlebars`),
    "utf-8"
  );

  const template = Handlebars.compile(templateSource);

  const mailOptions = {
    from: "Guanaco Rental hola@guanacorental.com",
    to: email,
    subject: "PEDIDO CANCELADO",
    html: template({ orderNumber }),
  };

  const mail = await transporter.sendMail(mailOptions);
  return mail;
};
