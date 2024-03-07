/* eslint-disable */
const xl = require("excel4node");
import { type NextApiRequest, type NextApiResponse } from "next";
import { prisma } from "@/server/db";
import dayjs from "dayjs";
import "dayjs/locale/es";

dayjs.locale("es");

type Query = {
  where: {
    available: boolean;
    owner?: {
      some: {
        location: {
          id: string;
        };
      };
    };
  };
  include: {
    owner: {
      where?: {
        deleted: boolean;
      };
      include: {
        owner: boolean;
        location: boolean;
      };
    };
    category: boolean;
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { location }: { location: string } = req.body;

    const query: Query = {
      where: {
        available: true,
      },
      include: {
        owner: {
          where: { deleted: false },
          include: { owner: true, location: true },
        },
        category: true,
      },
    };

    if (location !== "all") {
      query.where.owner = { some: { location: { id: location } } };
    }

    const equipments = await prisma.equipment.findMany(query);

    const sortedCategories = [
      "Camaras",
      "Lentes",
      "Monitores",
      "Estabilizadores / Trípodes",
      "Iluminación",
      "Sonido",
      "Grip",
      "Otros",
    ];

    equipments.sort((a, b) => {
      return (
        sortedCategories.indexOf(a.category.name) -
        sortedCategories.indexOf(b.category.name)
      );
    });

    const workbook = new xl.Workbook();
    const worksheet = workbook.addWorksheet("Listado");

    const titleStyle = workbook.createStyle({
      alignment: {
        horizontal: ["center"],
        vertical: ["center"],
      },
      font: {
        bold: true,
        size: 18,
      },
      fill: {
        type: "pattern",
        patternType: "solid",
        fgColor: "#e37a2c",
      },
    });

    const headerStyle = workbook.createStyle({
      font: {
        bold: true,
        color: "#000000",
        size: 12,
      },
      fill: {
        type: "pattern",
        patternType: "solid",
        fgColor: "#e8974f",
      },
    });

    const bodyStyle = workbook.createStyle({
      fill: {
        type: "pattern",
        patternType: "solid",
        fgColor: "#f0bc81",
      },
    });

    const priceStyle = workbook.createStyle({
      numberFormat: "$0,0",
    });

    const headers = [
      "Categoría",
      "Nombre",
      "Marca",
      "Modelo",
      "Precio",
      "Stock",
    ];

    worksheet
      .cell(1, 1, 1, 6, true)
      .string(`Listado de Equipos - Guanaco Rental`)
      .style(titleStyle);

    headers.forEach((header, index) => {
      worksheet
        .cell(2, index + 1)
        .string(header)
        .style(headerStyle);
    });

    worksheet.column(2).setWidth(25);
    worksheet.column(4).setWidth(20);
    worksheet.row(1).setHeight(30);
    worksheet.row(2).setHeight(20);

    const equipmentsData: (string | number)[][] = [];
    equipments.map((equipment) => {
      const rowData = [
        equipment.category.name,
        equipment.name,
        equipment.brand,
        equipment.model,
        equipment.price,
        equipment.owner
          .map((owner) => owner.stock)
          .reduce((acc, curr) => acc + curr, 0),
      ];
      equipmentsData.push(rowData);
    });

    equipmentsData.forEach((equiomentRow, rowIndex) => {
      equiomentRow.forEach((cellValue, columnIndex) => {
        const cell = worksheet.cell(rowIndex + 3, columnIndex + 1);

        if (columnIndex === 4 && typeof cellValue === "number") {
          cell.number(cellValue).style(priceStyle).style(bodyStyle);
        } else if (typeof cellValue === "number") {
          cell.number(cellValue).style(bodyStyle);
        } else if (typeof cellValue === "string") {
          cell.string(cellValue).style(bodyStyle);
        }
      });
    });

    // worksheet.cell(5, 16).formula(`=SUM(E2:E14)`);

    const buffer = await workbook.writeToBuffer();

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=archivo.xlsx");
    return res.status(200).send(buffer);
  } else {
    // Handle any other HTTP method
  }
}
