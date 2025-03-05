import { Category, EntityScore, Score } from '../types';

export const calculateScores = (
  entityScores: EntityScore[],
  categories: Category[]
): EntityScore[] => {
  return entityScores.map((entityScore) => {
    const categoryScores: Record<string, number> = {};
    let totalScore = 0;
    let totalWeight = 0;

    // Calculate score for each category
    categories.forEach((category) => {
      let categoryScore = 0;
      let categoryMaxScore = 0;

      category.criteria.forEach((criterion) => {
        const score = entityScore.scores.find(
          (s) => s.criteriaId === criterion.id
        );
        
        if (score) {
          // Normalize score based on max possible score
          categoryScore += (score.value / criterion.maxScore) * criterion.weight;
          categoryMaxScore += criterion.weight;
        }
      });

      // Calculate weighted category score (as a percentage)
      if (categoryMaxScore > 0) {
        const normalizedCategoryScore = (categoryScore / categoryMaxScore) * 100;
        categoryScores[category.id] = normalizedCategoryScore;
        totalScore += normalizedCategoryScore * category.weight;
        totalWeight += category.weight;
      }
    });

    // Normalize total score based on weights
    const normalizedTotalScore = totalWeight > 0 ? totalScore / totalWeight : 0;

    return {
      ...entityScore,
      categoryScores,
      totalScore: normalizedTotalScore,
    };
  });
};

export const getTopPerformers = (
  entityScores: EntityScore[],
  count: number = 3
): EntityScore[] => {
  return [...entityScores]
    .sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0))
    .slice(0, count);
};

export const getAreasForImprovement = (
  entityScore: EntityScore,
  categories: Category[]
): { categoryId: string; categoryName: string; score: number }[] => {
  if (!entityScore.categoryScores) return [];

  return categories
    .map((category) => ({
      categoryId: category.id,
      categoryName: category.name,
      score: entityScore.categoryScores?.[category.id] || 0,
    }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);
};