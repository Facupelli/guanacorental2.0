const xl = require("excel4node");
import { type NextApiRequest, type NextApiResponse } from "next";
import { prisma } from "@/server/db";
import { Prisma } from "@prisma/client";
import dayjs from "dayjs";

type Query = {
  where?: {
    book: {
      start_date: {
        gte: Date;
        lte: Date;
      };
    };
  };
  include: {
    customer: {
      include: { address: true };
    };
    location: true;
    book: true;
    earnings: true;
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    // Process a POST request
    const { year, month }: { year: string; month: string } = req.body;

    const query: Query = {
      include: {
        customer: {
          include: { address: true },
        },
        location: true,
        book: true,
        earnings: true,
      },
    };

    if (month === "all" && year) {
      const firstMonthDay = dayjs(`${year}-01`).startOf("month").toDate();
      const lastMonthDay = dayjs(`${year}-12`).endOf("month").toDate();

      query.where = {
        book: { start_date: { gte: firstMonthDay, lte: lastMonthDay } },
      };
    }

    if (month !== "all" && year) {
      const firstMonthDay = dayjs(`${year}-${month}`).startOf("month").toDate();
      const lastMonthDay = dayjs(`${year}-${month}`).endOf("month").toDate();

      query.where = {
        book: { start_date: { gte: firstMonthDay, lte: lastMonthDay } },
      };
    }

    const orders = await prisma.order.findMany(query);

    const workbook = new xl.Workbook();
    const worksheet = workbook.addWorksheet("Sheet 1");

    const headerStyle = workbook.createStyle({
      font: {
        bold: true,
        color: "#000000",
        size: 12,
      },
      fill: {
        type: "pattern",
        patternType: "solid",
        fgColor: "#f67127",
      },
    });

    const priceStyle = workbook.createStyle({
      numberFormat: "$0,0",
    });

    const headers = [
      "Nombre",
      "Retiro",
      "Devolución",
      "Subtotal",
      "Total",
      "Federico",
      "Oscar",
      "Sub",
    ];

    headers.forEach((header, index) => {
      worksheet
        .cell(1, index + 1)
        .string(header)
        .style(headerStyle);
    });

    worksheet.column(1).setWidth(20);
    worksheet.row(1).setHeight(20);

    const ordersData: (string | number | null | undefined)[][] = [];
    orders.map((order) => {
      const rowData = [
        order?.customer.name,
        order?.book.start_date.toLocaleDateString("es-AR", {
          day: "numeric",
          month: "short",
        }),
        order?.book.end_date.toLocaleDateString("es-AR", {
          day: "numeric",
          month: "short",
        }),
        order?.subtotal,
        order?.total,
        order.earnings[0]?.federico,
        order.earnings[0]?.oscar,
        order.earnings[0]?.sub,
      ];
      ordersData.push(rowData);
    });

    ordersData.forEach((rowOrder, rowIndex) => {
      rowOrder.forEach((cellValue, columnIndex) => {
        if (typeof cellValue === "number") {
          worksheet
            .cell(rowIndex + 2, columnIndex + 1)
            .number(cellValue)
            .style(priceStyle);
        }
        if (typeof cellValue === "string") {
          worksheet.cell(rowIndex + 2, columnIndex + 1).string(cellValue);
        }
      });
    });

    worksheet.cell(5, 16).formula(`=SUM(E2:E14)`);

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
