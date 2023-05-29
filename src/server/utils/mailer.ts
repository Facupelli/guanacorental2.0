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
  total?: string;
};

export const sendMail = async (
  user: User,
  templateName: string,
  subject: string
) => {
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
    subject,
    html: template(user),
  };

  const mail = await transporter.sendMail(mailOptions);
  return mail;
};

export const sendOrderDeliveredMail = async (user: User) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "hola@guanacorental.com",
      pass: NODEMAILER_G_APP,
    },
  });

  const templateSource = fs.readFileSync(
    path.resolve(
      process.cwd() + `/src/server/utils/templates/orderDelivered.handlebars`
    ),
    "utf-8"
  );

  const template = handlebars.compile(templateSource);

  const mailOptions = {
    from: "Guanaco Rental hola@guanacorental.com",
    to: user.email,
    subject: "PEDIDO RETIRADO CON ÉXITO",
    html: template(user),
    attachments: [
      {
        filename: "enviarmail.pdf",
        contentType: "application/pdf",
        path: "C:/Users/facun/Desktop/enviarmail.pdf",
      },
    ],
  };

  const mail = await transporter.sendMail(mailOptions);
  return mail;
};
