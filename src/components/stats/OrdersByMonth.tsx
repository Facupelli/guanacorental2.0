import { Bar } from "react-chartjs-2";

const options = {
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: "Cantidad de pedidos",
      },
    },
  },
};

export default function OrdersByMonth({
  ordersByMonth,
}: {
  ordersByMonth: {
    ordersByMonth: { [key: number]: number };
    sjOrdersByMonth: { [key: number]: number };
    mdzOrdersByMonth: { [key: number]: number };
    avg: string;
  };
}) {
  const data = {
    labels: [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ],
    datasets: [
      {
        label: "Totales",
        data: Object.values(ordersByMonth.ordersByMonth), // Tus datos aquí
        backgroundColor: "#CF6120",
        borderWidth: 1,
      },
      {
        label: "San Juan",
        data: Object.values(ordersByMonth.sjOrdersByMonth), // Tus datos aquí
        backgroundColor: "#20B5CF",
        borderWidth: 1,
      },
      {
        label: "Mendoza",
        data: Object.values(ordersByMonth.mdzOrdersByMonth), // Tus datos aquí
        backgroundColor: "#204FCF",
        borderWidth: 1,
      },
    ],
  };

  return <Bar options={options} data={data} />;
}
