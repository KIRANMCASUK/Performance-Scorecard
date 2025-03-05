import React, { useState } from 'react';
import { Bar, Radar } from 'react-chartjs-2';
import { Award, TrendingUp, TrendingDown } from 'lucide-react';
import { EntityScore, Category } from '../types';
import { getTopPerformers, getAreasForImprovement } from '../utils/scoreCalculator';

interface ComparativeAnalysisProps {
  entityScores: EntityScore[];
  categories: Category[];
}

const ComparativeAnalysis: React.FC<ComparativeAnalysisProps> = ({
  entityScores,
  categories,
}) => {
  const [selectedEntities, setSelectedEntities] = useState<string[]>([]);

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

  // Handle entity selection
  const handleEntitySelection = (entityId: string) => {
    if (selectedEntities.includes(entityId)) {
      setSelectedEntities(selectedEntities.filter((id) => id !== entityId));
    } else {
      setSelectedEntities([...selectedEntities, entityId]);
    }
  };

  // Prepare data for comparison chart
  const prepareComparisonData = () => {
    const selectedEntityData = entityScores.filter((entity) =>
      selectedEntities.includes(entity.entityId)
    );
    
    const labels = categories.map((category) => category.name);
    const datasets = selectedEntityData.map((entity, index) => {
      const color = generateColors(selectedEntityData.length)[index];
      return {
        label: entity.entityName,
        data: categories.map((category) => entity.categoryScores?.[category.id] || 0),
        backgroundColor: color + '40', // Add transparency
        borderColor: color,
        borderWidth: 1,
        fill: true,
      };
    });
    
    return {
      labels,
      datasets,
    };
  };

  // Get top performers
  const topPerformers = getTopPerformers(entityScores, 3);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-6">Comparative Analysis</h2>

      {entityScores.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">No data available</p>
          <p className="text-sm">Add entities and scores to view comparative analysis</p>
        </div>
      ) : (
        <>
          {/* Top Performers */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <Award className="h-5 w-5 text-yellow-500 mr-2" />
              Top Performers
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topPerformers.map((entity, index) => (
                <div
                  key={entity.entityId}
                  className="bg-gray-50 rounded-lg p-4 border-l-4"
                  style={{
                    borderLeftColor:
                      index === 0
                        ? '#ECC94B' // gold
                        : index === 1
                        ? '#A0AEC0' // silver
                        : '#ED8936', // bronze
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{entity.entityName}</h4>
                      <p className="text-2xl font-bold mt-2">
                        {entity.totalScore?.toFixed(2) || 'N/A'}
                      </p>
                    </div>
                    <div className="text-lg font-bold">#{index + 1}</div>
                  </div>
                  
                  <div className="mt-3">
                    <h5 className="text-sm font-medium mb-1">Strongest Categories:</h5>
                    {categories
                      .map((category) => ({
                        name: category.name,
                        score: entity.categoryScores?.[category.id] || 0,
                      }))
                      .sort((a, b) => b.score - a.score)
                      .slice(0, 2)
                      .map((category, i) => (
                        <div key={i} className="flex items-center text-sm">
                          <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                          <span>
                            {category.name}: {category.score.toFixed(2)}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Side-by-Side Comparison */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4">Side-by-Side Comparison</h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Select entities to compare (2-5 recommended):</p>
              <div className="flex flex-wrap gap-2">
                {entityScores.map((entity) => (
                  <button
                    key={entity.entityId}
                    onClick={() => handleEntitySelection(entity.entityId)}
                    className={`px-3 py-1 text-sm rounded-full ${
                      selectedEntities.includes(entity.entityId)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {entity.entityName}
                  </button>
                ))}
              </div>
            </div>

            {selectedEntities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Bar Chart Comparison */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-medium mb-3">Category Comparison</h4>
                  <div className="h-60">
                    <Bar
                      data={prepareComparisonData()}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            max: 100,
                          },
                        },
                      }}
                    />
                  </div>
                </div>

                {/* Radar Chart Comparison */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-medium mb-3">Performance Radar</h4>
                  <div className="h-60">
                    <Radar
                      data={prepareComparisonData()}
                      options={{
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
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 italic text-center py-4">
                Select entities to compare them
              </p>
            )}
          </div>

          {/* Areas for Improvement */}
          {selectedEntities.length === 1 && (
            <div>
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 text-blue-500 mr-2" />
                Areas for Improvement
              </h3>
              
              {(() => {
                const entity = entityScores.find((e) => e.entityId === selectedEntities[0]);
                if (!entity) return null;
                
                const improvementAreas = getAreasForImprovement(entity, categories);
                
                return (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium mb-3">{entity.entityName}</h4>
                    
                    {improvementAreas.length > 0 ? (
                      <div className="space-y-3">
                        {improvementAreas.map((area) => (
                          <div key={area.categoryId} className="flex items-start">
                            <TrendingDown className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                            <div>
                              <p className="font-medium">{area.categoryName}</p>
                              <p className="text-sm text-gray-600">
                                Score: {area.score.toFixed(2)}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                Recommendation: Focus on improving performance in this category to boost overall score.
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">No improvement areas identified</p>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ComparativeAnalysis;