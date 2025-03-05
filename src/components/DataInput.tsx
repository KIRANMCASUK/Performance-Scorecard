import React, { useState } from 'react';
import { Upload, FileUp, Plus, Trash2, AlertCircle } from 'lucide-react';
import { Category, Criteria, EntityScore, Score } from '../types';
import { parseFile } from '../utils/fileUtils';

interface DataInputProps {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  entityScores: EntityScore[];
  setEntityScores: React.Dispatch<React.SetStateAction<EntityScore[]>>;
}

const DataInput: React.FC<DataInputProps> = ({
  categories,
  setCategories,
  entityScores,
  setEntityScores,
}) => {
  const [showAddEntity, setShowAddEntity] = useState(false);
  const [newEntityName, setNewEntityName] = useState('');
  const [newEntityScores, setNewEntityScores] = useState<Record<string, number>>({});
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryWeight, setNewCategoryWeight] = useState(1);
  const [showAddCriteria, setShowAddCriteria] = useState<string | null>(null);
  const [newCriteriaName, setNewCriteriaName] = useState('');
  const [newCriteriaWeight, setNewCriteriaWeight] = useState(1);
  const [newCriteriaMaxScore, setNewCriteriaMaxScore] = useState(10);
  const [fileUploadError, setFileUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setFileUploadError(null);

    try {
      if (categories.length === 0) {
        throw new Error('Please define categories and criteria before uploading data');
      }

      if (categories.some(category => category.criteria.length === 0)) {
        throw new Error('All categories must have at least one criterion defined');
      }

      const parsedData = await parseFile(file, categories);
      setEntityScores([...entityScores, ...parsedData]);
      e.target.value = ''; // Reset file input
    } catch (error) {
      console.error('Error parsing file:', error);
      setFileUploadError(error instanceof Error ? error.message : 'Unknown error parsing file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddEntity = () => {
    if (!newEntityName.trim()) return;

    const scores: Score[] = [];
    
    // Convert the score object to array format
    Object.entries(newEntityScores).forEach(([criteriaId, value]) => {
      scores.push({
        criteriaId,
        value,
      });
    });

    const newEntity: EntityScore = {
      entityId: `entity-${Date.now()}`,
      entityName: newEntityName,
      scores,
    };

    setEntityScores([...entityScores, newEntity]);
    setNewEntityName('');
    setNewEntityScores({});
    setShowAddEntity(false);
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;

    const newCategory: Category = {
      id: `category-${Date.now()}`,
      name: newCategoryName,
      weight: newCategoryWeight,
      criteria: [],
    };

    setCategories([...categories, newCategory]);
    setNewCategoryName('');
    setNewCategoryWeight(1);
    setShowAddCategory(false);
  };

  const handleAddCriteria = (categoryId: string) => {
    if (!newCriteriaName.trim()) return;

    const newCriteria: Criteria = {
      id: `criteria-${Date.now()}`,
      name: newCriteriaName,
      weight: newCriteriaWeight,
      maxScore: newCriteriaMaxScore,
    };

    const updatedCategories = categories.map((category) => {
      if (category.id === categoryId) {
        return {
          ...category,
          criteria: [...category.criteria, newCriteria],
        };
      }
      return category;
    });

    setCategories(updatedCategories);
    setNewCriteriaName('');
    setNewCriteriaWeight(1);
    setNewCriteriaMaxScore(10);
    setShowAddCriteria(null);
  };

  const handleRemoveCategory = (categoryId: string) => {
    setCategories(categories.filter((category) => category.id !== categoryId));
  };

  const handleRemoveCriteria = (categoryId: string, criteriaId: string) => {
    const updatedCategories = categories.map((category) => {
      if (category.id === categoryId) {
        return {
          ...category,
          criteria: category.criteria.filter((criteria) => criteria.id !== criteriaId),
        };
      }
      return category;
    });

    setCategories(updatedCategories);
  };

  const handleRemoveEntity = (entityId: string) => {
    setEntityScores(entityScores.filter((entity) => entity.entityId !== entityId));
  };

  const handleScoreChange = (criteriaId: string, value: number) => {
    setNewEntityScores({
      ...newEntityScores,
      [criteriaId]: value,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Data Input</h2>
      
      {/* File Upload */}
      <div className="mb-6 p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
        <label htmlFor="file-upload" className={`cursor-pointer flex flex-col items-center ${isUploading ? 'opacity-50' : ''}`}>
          <Upload className="h-8 w-8 text-blue-500 mb-2" />
          <span className="text-sm font-medium text-gray-700">Upload Excel or CSV file</span>
          <span className="text-xs text-gray-500 mt-1">Drag and drop or click to browse</span>
          <input
            id="file-upload"
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={handleFileUpload}
            disabled={isUploading || categories.length === 0}
          />
        </label>
        {fileUploadError && (
          <div className="mt-3 p-3 bg-red-50 text-red-700 rounded-md flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{fileUploadError}</p>
          </div>
        )}
        {categories.length === 0 && (
          <div className="mt-3 p-3 bg-yellow-50 text-yellow-700 rounded-md">
            <p className="text-sm">Please define categories and criteria before uploading data</p>
          </div>
        )}
        <div className="mt-3 text-xs text-gray-500">
          <p className="font-medium mb-1">Expected file format:</p>
          <p>- First row should contain column headers</p>
          <p>- Column names should match criteria names</p>
          <p>- Each row represents one entity (e.g., employee, project)</p>
          <p>- Include columns for entity name/ID</p>
        </div>
      </div>

      {/* Categories and Criteria Configuration */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Categories & Criteria</h3>
          <button
            onClick={() => setShowAddCategory(true)}
            className="flex items-center text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-md hover:bg-blue-100"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Category
          </button>
        </div>

        {/* Add Category Form */}
        {showAddCategory && (
          <div className="bg-gray-50 p-4 rounded-md mb-4">
            <h4 className="font-medium mb-2">Add New Category</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g., Productivity"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={newCategoryWeight}
                  onChange={(e) => setNewCategoryWeight(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowAddCategory(false)}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCategory}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Category
              </button>
            </div>
          </div>
        )}

        {/* Categories List */}
        <div className="space-y-4">
          {categories.map((category) => (
            <div key={category.id} className="border border-gray-200 rounded-md p-4">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h4 className="font-medium">{category.name}</h4>
                  <p className="text-sm text-gray-500">Weight: {category.weight}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowAddCriteria(category.id)}
                    className="flex items-center text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Criteria
                  </button>
                  <button
                    onClick={() => handleRemoveCategory(category.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Add Criteria Form */}
              {showAddCriteria === category.id && (
                <div className="bg-gray-50 p-3 rounded-md mb-3">
                  <h5 className="text-sm font-medium mb-2">Add New Criteria</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={newCriteriaName}
                        onChange={(e) => setNewCriteriaName(e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                        placeholder="e.g., Tasks Completed"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Weight
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={newCriteriaWeight}
                        onChange={(e) => setNewCriteriaWeight(Number(e.target.value))}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Max Score
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={newCriteriaMaxScore}
                        onChange={(e) => setNewCriteriaMaxScore(Number(e.target.value))}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setShowAddCriteria(null)}
                      className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleAddCriteria(category.id)}
                      className="px-2 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Add Criteria
                    </button>
                  </div>
                </div>
              )}

              {/* Criteria List */}
              {category.criteria.length > 0 ? (
                <div className="mt-2">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-3 py-2 text-left">Criteria</th>
                        <th className="px-3 py-2 text-left">Weight</th>
                        <th className="px-3 py-2 text-left">Max Score</th>
                        <th className="px-3 py-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {category.criteria.map((criteria) => (
                        <tr key={criteria.id} className="border-t border-gray-100">
                          <td className="px-3 py-2">{criteria.name}</td>
                          <td className="px-3 py-2">{criteria.weight}</td>
                          <td className="px-3 py-2">{criteria.maxScore}</td>
                          <td className="px-3 py-2 text-right">
                            <button
                              onClick={() => handleRemoveCriteria(category.id, criteria.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No criteria added yet</p>
              )}
            </div>
          ))}

          {categories.length === 0 && (
            <p className="text-gray-500 italic text-center py-4">
              No categories defined. Add a category to get started.
            </p>
          )}
        </div>
      </div>

      {/* Manual Entity Input */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Entities</h3>
          <button
            onClick={() => setShowAddEntity(true)}
            className={`flex items-center text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-md hover:bg-blue-100 ${
              categories.length === 0 || categories.some(c => c.criteria.length === 0) 
                ? 'opacity-50 cursor-not-allowed' 
                : ''
            }`}
            disabled={categories.length === 0 || categories.some(c => c.criteria.length === 0)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Entity
          </button>
        </div>

        {/* Add Entity Form */}
        {showAddEntity && (
          <div className="bg-gray-50 p-4 rounded-md mb-4">
            <h4 className="font-medium mb-2">Add New Entity</h4>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Entity Name
              </label>
              <input
                type="text"
                value={newEntityName}
                onChange={(e) => setNewEntityName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="e.g., Employee Name or Project Title"
              />
            </div>

            <h5 className="text-sm font-medium mb-2">Scores</h5>
            {categories.map((category) => (
              <div key={category.id} className="mb-4">
                <h6 className="text-sm font-medium text-gray-700 mb-2">{category.name}</h6>
                <div className="space-y-3">
                  {category.criteria.map((criteria) => (
                    <div key={criteria.id} className="grid grid-cols-2 gap-4 items-center">
                      <label className="text-sm text-gray-700">{criteria.name}</label>
                      <input
                        type="number"
                        min="0"
                        max={criteria.maxScore}
                        value={newEntityScores[criteria.id] || 0}
                        onChange={(e) => handleScoreChange(criteria.id, Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder={`Max: ${criteria.maxScore}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setShowAddEntity(false)}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEntity}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                disabled={!newEntityName.trim()}
              >
                Add Entity
              </button>
            </div>
          </div>
        )}

        {/* Entities List */}
        {entityScores.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">Entity Name</th>
                  <th className="px-4 py-2 text-left"># of Scores</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {entityScores.map((entity) => (
                  <tr key={entity.entityId} className="border-t border-gray-100">
                    <td className="px-4 py-2">{entity.entityName}</td>
                    <td className="px-4 py-2">{entity.scores.length}</td>
                    <td className="px-4 py-2 text-right">
                      <button
                        onClick={() => handleRemoveEntity(entity.entityId)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 italic text-center py-4">
            No entities added yet. Upload a file or add entities manually.
          </p>
        )}
      </div>
    </div>
  );
};

export default DataInput;