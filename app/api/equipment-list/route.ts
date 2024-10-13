/* eslint-disable */
const xl = require("excel4node");
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

export async function POST(request: Request) {
  const { location }: { location: string } = await request.json();

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
    return sortedCategories.indexOf(a.category.name) - sortedCategories.indexOf(b.category.name);
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

  const tabHaders = ["Categoría", "Nombre", "Marca", "Modelo", "Precio", "Stock"];

  worksheet.cell(1, 1, 1, 6, true).string(`Listado de Equipos - Guanaco Rental`).style(titleStyle);

  tabHaders.forEach((header, index) => {
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
      equipment.owner.map((owner) => owner.stock).reduce((acc, curr) => acc + curr, 0),
    ];
    equipmentsData.push(rowData);
  });

  equipmentsData.forEach((equipmentRow, rowIndex) => {
    equipmentRow.forEach((cellValue, columnIndex) => {
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

  const buffer = await workbook.writeToBuffer();

  const headers = new Headers();
  headers.set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  headers.set("Content-Disposition", "attachment; filename=archivo.xlsx");

  return new Response(buffer, { status: 200, headers });
}
