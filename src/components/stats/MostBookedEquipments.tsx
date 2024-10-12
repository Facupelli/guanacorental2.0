import { type TopBookedEquipment } from "trpc/routers/stats";
import { Bar } from "react-chartjs-2";

const options = {
  indexAxis: "y" as const,
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "right" as const,
    },
    title: {
      display: true,
      text: "Equipos con más pedidos",
    },
  },
};

function groupOwnersByLocation(equipments: TopBookedEquipment[]) {
  return equipments.map((equipment) => {
    const ordersByLocation: Record<string, number> = {};

    equipment.owner.forEach((owner) => {
      if (!ordersByLocation[owner.location.name]) {
        ordersByLocation[owner.location.name] = 0;
      }
      ordersByLocation[owner.location.name] += owner.orders.length;
    });

    return {
      ...equipment,
      ordersByLocation,
    };
  });
}

export default function MostBookedEquipments({ equipments }: { equipments: TopBookedEquipment[] }) {
  const labels = equipments.map((equipment) => `${equipment.name} ${equipment.model}`);

  const grouped = groupOwnersByLocation(equipments);

  const mostBookedEquipments = {
    labels,
    datasets: [
      {
        label: "Total",
        data: grouped.map(
          (equipment) => (equipment.ordersByLocation["San Juan"] ?? 0) + (equipment.ordersByLocation["Mendoza"] ?? 0)
        ),
        backgroundColor: "#CF6120",
      },
      {
        label: "San Juan",
        data: grouped.map((equipment) => equipment.ordersByLocation["San Juan"]),
        backgroundColor: "#20B5CF",
      },
      {
        label: "Mendoza",
        data: grouped.map((equipment) => equipment.ordersByLocation["Mendoza"]),
        backgroundColor: "#204FCF",
      },
    ],
  };

  return <Bar options={options} data={mostBookedEquipments} />;
}
