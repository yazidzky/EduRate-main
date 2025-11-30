import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface SpiderChartProps {
  data: {
    labels: string[];
    values: number[];
  };
  title?: string;
  percentage?: boolean;
  max?: number;
}

export const SpiderChart = ({ data, title, percentage = false, max = 5 }: SpiderChartProps) => {
  const values = percentage
    ? data.values.map((v) => Math.round((v / max) * 100))
    : data.values;

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: title || 'Rating',
        data: values,
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(16, 185, 129, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(16, 185, 129, 1)',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)',
        },
        suggestedMin: 0,
        suggestedMax: percentage ? 100 : max,
        ticks: {
          stepSize: percentage ? 20 : 1,
          callback: (value: number | string) =>
            percentage ? `${value}%` : value,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <div className="w-full h-[300px]">
      <Radar data={chartData} options={options} />
    </div>
  );
};
