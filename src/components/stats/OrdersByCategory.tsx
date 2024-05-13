import { Pie } from "react-chartjs-2";

type Order = {
  categories: string[];
  total: number;
};

const options = {
  plugins: {
    title: {
      display: true,
      text: "Categorías más presentes en los pedidos", // reemplaza esto con el título que quieras
    },
  },
};

export default function OrdersByCategory({ orders }: { orders: Order[] }) {
  const categories: { [key: string]: number } = {};

  orders.forEach((order) => {
    order.categories.forEach((category) => {
      categories[category] = (categories[category] || 0) + 1;
    });
  });

  const labels = Object.keys(categories);
  const data = Object.values(categories);

  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: labels.map(
          () => "#" + Math.floor(Math.random() * 16777215).toString(16)
        ),
      },
    ],
  };

  return <Pie data={chartData} options={options} />;
}
