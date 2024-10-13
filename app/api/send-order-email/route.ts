import nodemailer from "nodemailer";
import fs from "fs/promises";
import path from "path";
import handlebars from "handlebars";
import { Readable } from "stream";
import { NextResponse } from "next/server";

const NODEMAILER_G_APP = process.env.NODEMAILER_G_APP;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const pdfFile = formData.get("pdf") as File;
    const userEmail = formData.get("email") as string;
    const orderNumber = formData.get("orderNumber") as string;

    if (!pdfFile || !userEmail || !orderNumber) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const buffer = await pdfFile.arrayBuffer();
    const stream = new Readable();
    stream.push(Buffer.from(buffer));
    stream.push(null);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "hola@guanacorental.com",
        pass: NODEMAILER_G_APP,
      },
    });

    const templateSource = await fs.readFile(
      path.resolve(process.cwd() + `/src/server/utils/templates/orderDelivered.handlebars`),
      "utf-8"
    );

    const template = handlebars.compile(templateSource);

    const mailOptions = {
      from: "Guanaco Rental hola@guanacorental.com",
      to: userEmail,
      subject: `PEDIDO #${orderNumber} RETIRADO CON ÉXITO`,
      html: template({}),
      attachments: [
        {
          filename: pdfFile.name,
          content: stream,
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: "Email sent successfully." }, { status: 200 });
  } catch (error) {
    console.error("Server error:", error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
