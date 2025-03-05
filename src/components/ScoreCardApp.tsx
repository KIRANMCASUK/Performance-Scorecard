import React, { useState, useEffect } from 'react';
import { ClipboardCheck, BarChart2, TrendingUp, FileText } from 'lucide-react';
import DataInput from './DataInput';
import Dashboard from './Dashboard';
import ComparativeAnalysis from './ComparativeAnalysis';
import { Category, EntityScore } from '../types';
import { calculateScores } from '../utils/scoreCalculator';
import clsx from 'clsx';

function ScoreCardApp() {
  const [activeTab, setActiveTab] = useState<'input' | 'dashboard' | 'comparison'>('input');
  const [categories, setCategories] = useState<Category[]>([
    {
      id: 'category-1',
      name: 'Productivity',
      weight: 3,
      criteria: [
        {
          id: 'criteria-1',
          name: 'Tasks Completed',
          weight: 2,
          maxScore: 10,
        },
        {
          id: 'criteria-2',
          name: 'Efficiency',
          weight: 1,
          maxScore: 5,
        },
      ],
    },
    {
      id: 'category-2',
      name: 'Quality',
      weight: 2,
      criteria: [
        {
          id: 'criteria-3',
          name: 'Error Rate',
          weight: 1,
          maxScore: 5,
        },
        {
          id: 'criteria-4',
          name: 'Customer Satisfaction',
          weight: 2,
          maxScore: 10,
        },
      ],
    },
    {
      id: 'category-3',
      name: 'Timeliness',
      weight: 1,
      criteria: [
        {
          id: 'criteria-5',
          name: 'Deadlines Met',
          weight: 1,
          maxScore: 5,
        },
      ],
    },
  ]);
  
  const [rawEntityScores, setRawEntityScores] = useState<EntityScore[]>([
    {
      entityId: 'entity-1',
      entityName: 'John Doe',
      scores: [
        { criteriaId: 'criteria-1', value: 8 },
        { criteriaId: 'criteria-2', value: 4 },
        { criteriaId: 'criteria-3', value: 4 },
        { criteriaId: 'criteria-4', value: 9 },
        { criteriaId: 'criteria-5', value: 4 },
      ],
    },
    {
      entityId: 'entity-2',
      entityName: 'Jane Smith',
      scores: [
        { criteriaId: 'criteria-1', value: 9 },
        { criteriaId: 'criteria-2', value: 5 },
        { criteriaId: 'criteria-3', value: 5 },
        { criteriaId: 'criteria-4', value: 8 },
        { criteriaId: 'criteria-5', value: 5 },
      ],
    },
    {
      entityId: 'entity-3',
      entityName: 'Mike Johnson',
      scores: [
        { criteriaId: 'criteria-1', value: 7 },
        { criteriaId: 'criteria-2', value: 3 },
        { criteriaId: 'criteria-3', value: 4 },
        { criteriaId: 'criteria-4', value: 7 },
        { criteriaId: 'criteria-5', value: 3 },
      ],
    },
  ]);
  const [calculatedEntityScores, setCalculatedEntityScores] = useState<EntityScore[]>([]);

  useEffect(() => {
    const calculated = calculateScores(rawEntityScores, categories);
    setCalculatedEntityScores(calculated);
  }, [rawEntityScores, categories]);

  const TabButton = ({ tab, icon: Icon, label }: { tab: typeof activeTab; icon: any; label: string }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={clsx(
        'px-4 py-2 font-medium text-sm flex items-center transition-all duration-200 relative group',
        'btn-animate hover:bg-secondary-50 rounded-t-lg',
        activeTab === tab
          ? 'text-primary-600 bg-white border-t border-l border-r border-secondary-200'
          : 'text-secondary-500 hover:text-secondary-700'
      )}
    >
      <Icon className={clsx(
        "h-4 w-4 mr-2 transition-colors",
        activeTab === tab ? 'text-primary-600' : 'text-secondary-400 group-hover:text-secondary-600'
      )} />
      {label}
      {activeTab === tab && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 transform transition-transform duration-200" />
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-secondary-50 flex flex-col">
      <header className="bg-white shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <ClipboardCheck className="h-8 w-8 text-primary-600 mr-2" />
              <h1 className="text-xl font-bold text-secondary-900">Performance Scorecard Tool</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex space-x-1 border-b border-secondary-200 mb-6">
          <TabButton tab="input" icon={FileText} label="Data Input" />
          <TabButton tab="dashboard" icon={BarChart2} label="Dashboard" />
          <TabButton tab="comparison" icon={TrendingUp} label="Comparative Analysis" />
        </div>

        <div className="transition-all duration-300">
          {activeTab === 'input' && (
            <DataInput
              categories={categories}
              setCategories={setCategories}
              entityScores={rawEntityScores}
              setEntityScores={setRawEntityScores}
            />
          )}

          {activeTab === 'dashboard' && (
            <Dashboard
              entityScores={calculatedEntityScores}
              categories={categories}
            />
          )}

          {activeTab === 'comparison' && (
            <ComparativeAnalysis
              entityScores={calculatedEntityScores}
              categories={categories}
            />
          )}
        </div>
      </main>

      <footer className="bg-white border-t border-secondary-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-secondary-500 text-center">
            Performance Scorecard Tool © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}

export default ScoreCardApp;