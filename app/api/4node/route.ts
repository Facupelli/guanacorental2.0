/* eslint-disable */
const xl = require("excel4node");
import { prisma } from "~/utils/db";
import dayjs from "dayjs";
import "dayjs/locale/es";

dayjs.locale("es");

type Query = {
  orderBy?: {
    book?: {
      end_date: "asc" | "desc";
    };
  };
  where: {
    book?: {
      start_date: {
        gte: Date;
        lte: Date;
      };
    };
    locationId?: string;
  };
  include: {
    customer: {
      include: { address: true };
    };
    location: true;
    book: true;
    earning: true;
  };
};

// TODO: move to a server action
export async function POST(req: Request) {
  const body = await req.json();
  const { year, month, location }: { year: string; month: string; location: string } = body;

  const query: Query = {
    where: {},
    orderBy: {
      book: {
        end_date: "asc",
      },
    },
    include: {
      customer: {
        include: { address: true },
      },
      location: true,
      book: true,
      earning: true,
    },
  };

  if (month === "all" && year) {
    const firstMonthDay = dayjs(`${year}-01`).startOf("month").toDate();
    const lastMonthDay = dayjs(`${year}-12`).endOf("month").toDate();

    query.where.book = {
      start_date: { gte: firstMonthDay, lte: lastMonthDay },
    };
  }

  if (month !== "all" && year) {
    const firstMonthDay = dayjs(`${year}-${month}`).startOf("month").toDate();
    const lastMonthDay = dayjs(`${year}-${month}`).endOf("month").toDate();

    query.where = {
      book: { start_date: { gte: firstMonthDay, lte: lastMonthDay } },
    };
  }

  if (location !== "all") {
    query.where.locationId = location;
  }

  const orders = await prisma.order.findMany(query);

  const workbook = new xl.Workbook();
  const worksheet = workbook.addWorksheet("Sheet 1");

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

  const tabHeaders = ["N°", "Nombre", "Retiro", "Devolución", "Subtotal", "Total", "Federico", "Oscar", "Sub"];

  worksheet
    .cell(1, 1, 1, 9, true)
    .string(
      `Resumen rental ${dayjs()
        .month(Number(month) - 1)
        .format("MMMM")} ${year}`
    )
    .style(titleStyle);

  tabHeaders.forEach((header, index) => {
    worksheet
      .cell(2, index + 1)
      .string(header)
      .style(headerStyle);
  });

  worksheet.column(2).setWidth(20);
  worksheet.row(1).setHeight(30);
  worksheet.row(2).setHeight(20);

  const ordersData: (string | number | null | undefined)[][] = [];
  orders.map((order) => {
    const rowData = [
      order.number,
      order?.customer.name,
      order?.book.start_date.toLocaleDateString("es-AR", {
        day: "numeric",
        month: "short",
        timeZone: "America/Argentina/Buenos_Aires",
      }),
      order?.book.end_date.toLocaleDateString("es-AR", {
        day: "numeric",
        month: "short",
        timeZone: "America/Argentina/Buenos_Aires",
      }),
      order?.subtotal,
      order?.total,
      order.earning?.federico,
      order.earning?.oscar,
      order.earning?.sub,
    ];
    ordersData.push(rowData);
  });

  ordersData.forEach((rowOrder, rowIndex) => {
    rowOrder.forEach((cellValue, columnIndex) => {
      const cell = worksheet.cell(rowIndex + 3, columnIndex + 1);

      if (columnIndex === 0 && typeof cellValue === "number") {
        cell.number(cellValue).style(bodyStyle);
      } else if (typeof cellValue === "number") {
        cell.number(cellValue).style(priceStyle).style(bodyStyle);
      } else if (typeof cellValue === "string") {
        cell.string(cellValue).style(bodyStyle);
      }
    });
  });

  worksheet.cell(5, 16).formula(`=SUM(E2:E14)`);

  const buffer = await workbook.writeToBuffer();

  const headers = new Headers();
  headers.set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  headers.set("Content-Disposition", "attachment; filename=archivo.xlsx");

  return new Response(buffer, {
    headers,
  });
}
