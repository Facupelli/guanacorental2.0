import { type BookedEquipment as BookedEquipmentType } from "trpc/routers/stats";
import { Bar } from "react-chartjs-2";

const options = {
  indexAxis: "y" as const,
  elements: {
    bar: {
      borderWidth: 2,
    },
  },
  responsive: true,
  plugins: {
    legend: {
      position: "right" as const,
    },
    title: {
      display: true,
      text: "Pedidos por equipo",
    },
  },
};

export default function BookedEquipment({ equipments }: { equipments: BookedEquipmentType[] }) {
  const labels = equipments.map((equipment) => `${equipment.name} ${equipment.model}`);

  function groupOwnersByLocation(equipments: BookedEquipmentType[]) {
    const result: { [key: string]: number } = {};

    equipments.forEach((equipment) => {
      equipment.owner.forEach((owner) => {
        const locationName = owner.location.name;
        const ordersCount = owner.orders.length;

        if (result[locationName]) {
          result[locationName] += ordersCount;
        } else {
          result[locationName] = ordersCount;
        }
      });
    });

    return result;
  }

  const grouped = groupOwnersByLocation(equipments);

  const mostBookedEquipments = {
    labels,
    datasets: [
      {
        label: "Total",
        data: [(grouped["San Juan"] ?? 0) + (grouped["Mendoza"] ?? 0)],
        backgroundColor: "#CF6120",
      },
      {
        label: "San Juan",
        data: [grouped["San Juan"]],
        backgroundColor: "#20B5CF",
      },
      {
        label: "Mendoza",
        data: [grouped["Mendoza"]],
        backgroundColor: "#204FCF",
      },
    ],
  };

  return <Bar options={options} data={mostBookedEquipments} />;
}
