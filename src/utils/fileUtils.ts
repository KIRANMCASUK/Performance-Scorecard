import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { EntityScore, Category, Score } from '../types';

// Parse Excel or CSV file
export const parseFile = (
  file: File,
  categories: Category[]
): Promise<EntityScore[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const result = e.target?.result;
        
        if (!result) {
          reject(new Error('Failed to read file'));
          return;
        }
        
        let data: any[] = [];
        
        if (file.name.endsWith('.csv')) {
          // Parse CSV file
          const csvResult = Papa.parse(result as string, {
            header: true,
            skipEmptyLines: true,
          });
          
          if (csvResult.errors && csvResult.errors.length > 0) {
            console.error('CSV parsing errors:', csvResult.errors);
            reject(new Error(`CSV parsing error: ${csvResult.errors[0].message}`));
            return;
          }
          
          data = csvResult.data as any[];
        } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          // Parse Excel file
          try {
            const workbook = XLSX.read(result, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            if (!sheetName) {
              reject(new Error('Excel file contains no sheets'));
              return;
            }
            const worksheet = workbook.Sheets[sheetName];
            data = XLSX.utils.sheet_to_json(worksheet);
          } catch (xlsxError) {
            console.error('Excel parsing error:', xlsxError);
            reject(new Error(`Excel parsing error: ${xlsxError instanceof Error ? xlsxError.message : 'Unknown error'}`));
            return;
          }
        } else {
          reject(new Error('Unsupported file format'));
          return;
        }
        
        if (!Array.isArray(data) || data.length === 0) {
          reject(new Error('No data found in file or invalid format'));
          return;
        }
        
        // Transform data to EntityScore format
        const entityScores: EntityScore[] = [];
        
        for (const row of data) {
          if (!row || typeof row !== 'object') {
            console.warn('Skipping invalid row:', row);
            continue;
          }
          
          const entityId = row.id || row.ID || row.entityId || `entity-${Math.random().toString(36).substr(2, 9)}`;
          const entityName = row.name || row.Name || row.entityName || `Entity ${entityId}`;
          
          const scores: Score[] = [];
          
          // Extract scores for each criteria
          categories.forEach((category) => {
            category.criteria.forEach((criterion) => {
              // Try different possible column naming formats
              const possibleKeys = [
                criterion.name,
                criterion.name.toLowerCase(),
                criterion.name.toUpperCase(),
                criterion.name.replace(/\s+/g, '_'),
                criterion.name.replace(/\s+/g, ''),
              ];
              
              let scoreValue: number | null = null;
              
              // Find the first matching key with a valid value
              for (const key of possibleKeys) {
                if (key in row && row[key] !== undefined && row[key] !== null) {
                  const parsedValue = parseFloat(row[key]);
                  if (!isNaN(parsedValue)) {
                    scoreValue = parsedValue;
                    break;
                  }
                }
              }
              
              if (scoreValue !== null) {
                scores.push({
                  criteriaId: criterion.id,
                  value: scoreValue,
                });
              }
            });
          });
          
          entityScores.push({
            entityId,
            entityName,
            scores,
          });
        }
        
        if (entityScores.length === 0) {
          reject(new Error('No valid entities found in file'));
          return;
        }
        
        resolve(entityScores);
      } catch (error) {
        console.error('Error parsing file:', error);
        reject(error instanceof Error ? error : new Error('Unknown error parsing file'));
      }
    };
    
    reader.onerror = (error) => {
      console.error('FileReader error:', error);
      reject(new Error('Error reading file'));
    };
    
    if (file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  });
};

// Export to Excel
export const exportToExcel = (
  entityScores: EntityScore[],
  categories: Category[]
): void => {
  // Create worksheet data
  const wsData = entityScores.map((entity) => {
    const row: Record<string, any> = {
      'Entity Name': entity.entityName,
      'Total Score': entity.totalScore?.toFixed(2),
    };
    
    // Add category scores
    categories.forEach((category) => {
      row[`${category.name} Score`] = entity.categoryScores?.[category.id]?.toFixed(2) || '0';
    });
    
    // Add individual criteria scores
    categories.forEach((category) => {
      category.criteria.forEach((criterion) => {
        const score = entity.scores.find((s) => s.criteriaId === criterion.id);
        row[criterion.name] = score?.value || '0';
      });
    });
    
    return row;
  });
  
  // Create workbook and worksheet
  const ws = XLSX.utils.json_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Scorecard');
  
  // Generate Excel file and trigger download
  XLSX.writeFile(wb, 'scorecard_export.xlsx');
};

// Export to CSV
export const exportToCSV = (
  entityScores: EntityScore[],
  categories: Category[]
): string[][] => {
  // Create headers
  const headers = [
    'Entity Name',
    'Total Score',
    ...categories.map((c) => `${c.name} Score`),
    ...categories.flatMap((c) => c.criteria.map((cr) => cr.name)),
  ];
  
  // Create rows
  const rows = entityScores.map((entity) => {
    const row = [
      entity.entityName,
      entity.totalScore?.toFixed(2) || '0',
      ...categories.map((c) => entity.categoryScores?.[c.id]?.toFixed(2) || '0'),
      ...categories.flatMap((c) =>
        c.criteria.map((cr) => {
          const score = entity.scores.find((s) => s.criteriaId === cr.id);
          return score?.value.toString() || '0';
        })
      ),
    ];
    return row;
  });
  
  return [headers, ...rows];
};

// Export to PDF
export const exportToPDF = (
  entityScores: EntityScore[],
  categories: Category[]
): void => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text('Performance Scorecard Report', 14, 22);
  doc.setFontSize(11);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
  
  // Create table data
  const tableColumn = [
    'Entity Name',
    'Total Score',
    ...categories.map((c) => `${c.name} Score`),
  ];
  
  const tableRows = entityScores.map((entity) => [
    entity.entityName,
    entity.totalScore?.toFixed(2) || '0',
    ...categories.map((c) => entity.categoryScores?.[c.id]?.toFixed(2) || '0'),
  ]);
  
  // @ts-ignore - jspdf-autotable types are not fully compatible
  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 40,
    theme: 'grid',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [66, 139, 202] },
  });
  
  // Add individual entity details
  let yPos = (doc as any).lastAutoTable.finalY + 20;
  
  entityScores.forEach((entity, index) => {
    // Check if we need a new page
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(12);
    doc.text(`${entity.entityName} - Detailed Scores`, 14, yPos);
    yPos += 10;
    
    // Create detailed table for this entity
    const detailColumns = ['Category', 'Criteria', 'Score', 'Max Score'];
    const detailRows: any[] = [];
    
    categories.forEach((category) => {
      category.criteria.forEach((criterion) => {
        const score = entity.scores.find((s) => s.criteriaId === criterion.id);
        detailRows.push([
          category.name,
          criterion.name,
          score?.value || '0',
          criterion.maxScore,
        ]);
      });
    });
    
    // @ts-ignore - jspdf-autotable types are not fully compatible
    doc.autoTable({
      head: [detailColumns],
      body: detailRows,
      startY: yPos,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 15;
  });
  
  // Save the PDF
  doc.save('scorecard_report.pdf');
};