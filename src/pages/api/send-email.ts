import formidable from "formidable";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import handlebars from "handlebars";
import { type NextApiRequest, type NextApiResponse } from "next";

export const config = {
  api: {
    bodyParser: false,
  },
};

const NODEMAILER_G_APP = process.env.NODEMAILER_G_APP;

export default (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    try {
      const form = new formidable.IncomingForm();

      form.parse(req, (error, fields, files) => {
        if (error) {
          console.error(error);
          return res
            .status(500)
            .json({ error: "Error al procesar el archivo." });
        }

        const pdfFile = files.pdf as formidable.File;
        const userEmail = fields.email;
        const orderNumber = fields.orderNumber as string;

        if (pdfFile.originalFilename) {
          // Aquí puedes realizar acciones con el archivo PDF, como guardarlo en el servidor o procesarlo de alguna manera.
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: "hola@guanacorental.com",
              pass: NODEMAILER_G_APP,
            },
          });

          const templateSource = fs.readFileSync(
            path.resolve(
              process.cwd() +
                `/src/server/utils/templates/orderDelivered.handlebars`
            ),
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
                filename: pdfFile.originalFilename,
                path: pdfFile.filepath,
              },
            ],
          };

          transporter.sendMail(mailOptions).catch((err) => console.log(err));

          return res
            .status(200)
            .json({ message: "Archivo recibido correctamente." });
        }
      });
    } catch (error) {
      console.error("Error en el servidor:", error);
      res.status(500).send("Error en el servidor.");
    }
  }
};
