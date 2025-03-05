import React, { useState } from 'react';
import { Bar, Pie, Radar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Download, BarChart3, PieChart, Activity, LineChart } from 'lucide-react';
import { EntityScore, Category, ChartData } from '../types';
import { exportToExcel, exportToCSV, exportToPDF } from '../utils/fileUtils';
import { CSVLink } from 'react-csv';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DashboardProps {
  entityScores: EntityScore[];
  categories: Category[];
}

const Dashboard: React.FC<DashboardProps> = ({ entityScores, categories }) => {
  const [selectedChart, setSelectedChart] = useState<'bar' | 'pie' | 'radar' | 'line'>('bar');
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);

  // Generate colors for charts
  const generateColors = (count: number) => {
    const colors = [
      '#4299E1', // blue
      '#48BB78', // green
      '#F6AD55', // orange
      '#F56565', // red
      '#9F7AEA', // purple
      '#ED64A6', // pink
      '#38B2AC', // teal
      '#ECC94B', // yellow
    ];
    
    return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
  };

  // Prepare data for total scores chart
  const prepareOverallScoresData = (): ChartData => {
    const labels = entityScores.map((entity) => entity.entityName);
    const data = entityScores.map((entity) => entity.totalScore || 0);
    const backgroundColor = generateColors(entityScores.length);
    
    return {
      labels,
      datasets: [
        {
          label: 'Overall Score',
          data,
          backgroundColor,
          borderColor: backgroundColor,
          borderWidth: 1,
        },
      ],
    };
  };

  // Prepare data for category comparison chart
  const prepareCategoryComparisonData = (): ChartData => {
    const labels = categories.map((category) => category.name);
    const datasets = entityScores.map((entity) => {
      const color = generateColors(1)[0];
      return {
        label: entity.entityName,
        data: categories.map((category) => entity.categoryScores?.[category.id] || 0),
        backgroundColor: color + '80', // Add transparency
        borderColor: color,
        borderWidth: 1,
      };
    });
    
    return {
      labels,
      datasets,
    };
  };

  // Prepare data for entity detail chart
  const prepareEntityDetailData = (): ChartData | null => {
    if (!selectedEntity) return null;
    
    const entity = entityScores.find((e) => e.entityId === selectedEntity);
    if (!entity) return null;
    
    const labels = categories.map((category) => category.name);
    const data = categories.map((category) => entity.categoryScores?.[category.id] || 0);
    const backgroundColor = generateColors(categories.length).map((color) => color + '80');
    const borderColor = generateColors(categories.length);
    
    return {
      labels,
      datasets: [
        {
          label: entity.entityName,
          data,
          backgroundColor,
          borderColor,
          borderWidth: 1,
        },
      ],
    };
  };

  // Prepare data for criteria breakdown chart
  const prepareCriteriaBreakdownData = (): ChartData | null => {
    if (!selectedEntity) return null;
    
    const entity = entityScores.find((e) => e.entityId === selectedEntity);
    if (!entity) return null;
    
    const allCriteria = categories.flatMap((category) => 
      category.criteria.map((criterion) => ({
        ...criterion,
        categoryName: category.name,
      }))
    );
    
    const labels = allCriteria.map((criterion) => `${criterion.categoryName}: ${criterion.name}`);
    const data = allCriteria.map((criterion) => {
      const score = entity.scores.find((s) => s.criteriaId === criterion.id);
      return score ? (score.value / criterion.maxScore) * 100 : 0;
    });
    
    const backgroundColor = generateColors(allCriteria.length).map((color) => color + '80');
    const borderColor = generateColors(allCriteria.length);
    
    return {
      labels,
      datasets: [
        {
          label: 'Score (%)',
          data,
          backgroundColor,
          borderColor,
          borderWidth: 1,
        },
      ],
    };
  };

  // Render the selected chart type
  const renderChart = () => {
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const,
        },
        tooltip: {
          callbacks: {
            label: function(context: any) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += context.parsed.y.toFixed(2);
              }
              return label;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
        },
      },
    };

    const radarOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          angleLines: {
            display: true,
          },
          suggestedMin: 0,
          suggestedMax: 100,
        },
      },
    };

    switch (selectedChart) {
      case 'bar':
        return (
          <div className="h-80">
            <Bar data={prepareOverallScoresData()} options={options} />
          </div>
        );
      case 'pie':
        return (
          <div className="h-80">
            <Pie data={prepareOverallScoresData()} />
          </div>
        );
      case 'radar':
        return (
          <div className="h-80">
            <Radar data={prepareCategoryComparisonData()} options={radarOptions} />
          </div>
        );
      case 'line':
        return (
          <div className="h-80">
            <Line data={prepareCategoryComparisonData()} options={options} />
          </div>
        );
      default:
        return null;
    }
  };

  // Prepare CSV data for export
  const csvData = entityScores.length > 0 ? exportToCSV(entityScores, categories) : [];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Dashboard</h2>
        
        {/* Export Options */}
        <div className="flex space-x-2">
          <button
            onClick={() => exportToPDF(entityScores, categories)}
            className="flex items-center text-sm bg-red-50 text-red-600 px-3 py-1 rounded-md hover:bg-red-100"
            disabled={entityScores.length === 0}
          >
            <Download className="h-4 w-4 mr-1" />
            PDF
          </button>
          
          <button
            onClick={() => exportToExcel(entityScores, categories)}
            className="flex items-center text-sm bg-green-50 text-green-600 px-3 py-1 rounded-md hover:bg-green-100"
            disabled={entityScores.length === 0}
          >
            <Download className="h-4 w-4 mr-1" />
            Excel
          </button>
          
          <CSVLink
            data={csvData}
            filename="scorecard_export.csv"
            className={`flex items-center text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-md hover:bg-blue-100 ${
              entityScores.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            target="_blank"
          >
            <Download className="h-4 w-4 mr-1" />
            CSV
          </CSVLink>
        </div>
      </div>

      {entityScores.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">No data available</p>
          <p className="text-sm">Add entities and scores to view the dashboard</p>
        </div>
      ) : (
        <>
          {/* Chart Type Selection */}
          <div className="flex space-x-2 mb-4">
            <button
              onClick={() => setSelectedChart('bar')}
              className={`flex items-center px-3 py-1 rounded-md text-sm ${
                selectedChart === 'bar'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <BarChart3 className="h-4 w-4 mr-1" />
              Bar
            </button>
            <button
              onClick={() => setSelectedChart('pie')}
              className={`flex items-center px-3 py-1 rounded-md text-sm ${
                selectedChart === 'pie'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <PieChart className="h-4 w-4 mr-1" />
              Pie
            </button>
            <button
              onClick={() => setSelectedChart('radar')}
              className={`flex items-center px-3 py-1 rounded-md text-sm ${
                selectedChart === 'radar'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Activity className="h-4 w-4 mr-1" />
              Radar
            </button>
            <button
              onClick={() => setSelectedChart('line')}
              className={`flex items-center px-3 py-1 rounded-md text-sm ${
                selectedChart === 'line'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <LineChart className="h-4 w-4 mr-1" />
              Line
            </button>
          </div>

          {/* Main Chart */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Overall Performance</h3>
            {renderChart()}
          </div>

          {/* Entity Selection for Detailed View */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Entity Details</h3>
            <select
              value={selectedEntity || ''}
              onChange={(e) => setSelectedEntity(e.target.value || null)}
              className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-md mb-4"
            >
              <option value="">Select an entity</option>
              {entityScores.map((entity) => (
                <option key={entity.entityId} value={entity.entityId}>
                  {entity.entityName}
                </option>
              ))}
            </select>

            {selectedEntity ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Entity Category Scores */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-medium mb-3">Category Scores</h4>
                  <div className="h-60">
                    <Bar data={prepareEntityDetailData() || { labels: [], datasets: [] }} />
                  </div>
                </div>

                {/* Entity Criteria Breakdown */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-medium mb-3">Criteria Breakdown</h4>
                  <div className="h-60">
                    <Bar data={prepareCriteriaBreakdownData() || { labels: [], datasets: [] }} />
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 italic">Select an entity to view detailed breakdown</p>
            )}
          </div>

          {/* Scorecard Table */}
          <div>
            <h3 className="text-lg font-medium mb-3">Scorecard Summary</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">Entity</th>
                    <th className="px-4 py-2 text-left">Total Score</th>
                    {categories.map((category) => (
                      <th key={category.id} className="px-4 py-2 text-left">
                        {category.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {entityScores.map((entity) => (
                    <tr key={entity.entityId} className="border-t border-gray-100">
                      <td className="px-4 py-2 font-medium">{entity.entityName}</td>
                      <td className="px-4 py-2">
                        <span className="font-medium">{entity.totalScore?.toFixed(2) || 'N/A'}</span>
                      </td>
                      {categories.map((category) => (
                        <td key={category.id} className="px-4 py-2">
                          {entity.categoryScores?.[category.id]?.toFixed(2) || 'N/A'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;