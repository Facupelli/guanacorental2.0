import { usePDF } from "@react-pdf/renderer";
import { RemitoPdf } from "../RemitoPdf";
import { type Prisma } from "@prisma/client";

type Order = Prisma.OrderGetPayload<{
  include: {
    customer: {
      include: { address: true };
    };
    location: true;
    book: true;
    equipments: {
      include: { books: true; equipment: true; owner: true };
    };
    earning: true;
  };
}>;

type RemitoProps = {
  order: Order;
};

const generatePdfRows = (order: Order) => {
  const equipmentRows = [];
  for (let i = 0; i < order.equipments.length; i += 4) {
    const chunk = order.equipments.slice(i, i + 4);

    equipmentRows.push(chunk);
  }

  return equipmentRows;
};

export const DownloadRemitoButton = ({ order }: RemitoProps) => {
  const pdfEquipmentRows = generatePdfRows(order);

  const [instance, updateInstance] = usePDF({
    document: <RemitoPdf order={order} pdfEquipmentRows={pdfEquipmentRows} />,
  });

  const handleDownload = (blob: Blob | null) => {
    if (!blob) return;
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = `${order.customer.name ?? "Cliente"} - ${order.number}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  };

  return (
    <button onClick={() => handleDownload(instance.blob)}>
      Descargar Remito
    </button>
  );
};
