import { type TopBookedEquipment } from "~/trpc/routers/stats";
import { Bar } from "react-chartjs-2";

const barStackedOptions = {
  responsive: true,
  plugins: {
    title: {
      display: true,
      text: "Frecuencia de las duraciones de los alquileres por equipo",
    },
  },
  scales: {
    x: {
      stacked: true,
      title: {
        display: true,
        text: "Duración del alquiler (días)",
      },
    },
    y: {
      stacked: true,
      title: {
        display: true,
        text: "Cantidad de alquileres",
      },
    },
  },
};

function groupOwnersByLocation(equipments: TopBookedEquipment[]) {
  return equipments.map((equipment) => {
    const ordersDurationsByLocation: Record<string, number[]> = {};

    equipment.owner.forEach((owner) => {
      if (!ordersDurationsByLocation[owner.location.name]) {
        ordersDurationsByLocation[owner.location.name] = [];
      }
      owner.orders.forEach((order) => ordersDurationsByLocation[owner.location.name]?.push(order.book.working_days));
    });

    return {
      name: `${equipment.name} ${equipment.model}`,
      ordersDurationsByLocation,
    };
  });
}

export default function MostBookedEquipmentsByDay({ equipments }: { equipments: TopBookedEquipment[] }) {
  const grouped = groupOwnersByLocation(equipments);

  const durationFrequencies = grouped.map((equipment) => {
    const frequencies: { name: string; durations: { [key: number]: number } } = {
      name: equipment.name,
      durations: {},
    };

    const sj = equipment.ordersDurationsByLocation["San Juan"] ?? [0];
    const mdz = equipment.ordersDurationsByLocation["Mendoza"] ?? [0];

    const totalOrdersDurationByLocation = [...sj, ...mdz];

    totalOrdersDurationByLocation?.forEach((duration) => {
      if (!frequencies.durations[duration]) {
        frequencies.durations[duration] = 0;
      }
      frequencies.durations[duration]++;
    });
    return frequencies;
  });

  const getRandomColor = () => "#" + Math.floor(Math.random() * 16777215).toString(16);

  const labels = [...new Set(durationFrequencies.flatMap((item) => Object.keys(item.durations).map(Number)))].sort(
    (a, b) => a - b
  );

  const datasets = durationFrequencies.map((item) => ({
    label: item.name,
    data: labels.map((label) => item.durations[label] || 0),
    backgroundColor: getRandomColor(),
  }));

  const bookedEquipmentsDuration = {
    labels: labels,
    datasets,
  };

  return <Bar data={bookedEquipmentsDuration} options={barStackedOptions} />;
}
