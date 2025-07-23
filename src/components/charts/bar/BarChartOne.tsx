"use client";

import React, { useRef, useEffect } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface BarChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string;
    }[];
  };
}

const BarChartOne: React.FC<BarChartProps> = ({ data }) => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      // Destroy existing chart instance if it exists
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');
      
      if (ctx) {
        chartInstance.current = new Chart(ctx, {
          type: 'bar',
          data: data,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  color: 'rgba(156, 163, 175, 0.1)',
                },
                ticks: {
                  font: {
                    size: 12,
                  },
                },
              },
              x: {
                grid: {
                  display: false,
                },
                ticks: {
                  font: {
                    size: 12,
                  },
                },
              },
            },
            plugins: {
              legend: {
                position: 'top',
                align: 'end',
                labels: {
                  boxWidth: 15,
                  usePointStyle: true,
                  pointStyle: 'circle',
                  padding: 20,
                  font: {
                    size: 12,
                  },
                },
              },
              tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                bodyFont: {
                  size: 12,
                },
                titleFont: {
                  size: 14,
                  weight: 'bold',
                },
                caretSize: 6,
                cornerRadius: 6,
                boxPadding: 6,
              },
            },
            animation: {
              duration: 1000,
            },
            // These properties need to be inside datasets
          },
        });

        // Set barPercentage and categoryPercentage directly on the datasets
        if (chartInstance.current.data.datasets) {
          chartInstance.current.data.datasets.forEach(dataset => {
            if (dataset.type === 'bar' || !dataset.type) {
              // @ts-expect-error - These properties exist but TypeScript doesn't recognize them
              dataset.barPercentage = 0.6;
              // @ts-expect-error - These properties exist but TypeScript doesn't recognize them
              dataset.categoryPercentage = 0.7;
            }
          });
          chartInstance.current.update();
        }
      }
    }

    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  return <canvas ref={chartRef} />;
};

export default BarChartOne;
