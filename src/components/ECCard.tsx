import React from 'react';
import { EC } from '../types/syllabus';
import { AssessmentRow } from './AssessmentRow';
import { calculateECGrade, formatGrade } from '../utils/gradeCalculations';

interface ECCardProps {
  ec: EC;
  onAssessmentGradeChange: (assessmentIndex: number, grade: number | undefined) => void;
}

export function ECCard({ ec, onAssessmentGradeChange }: ECCardProps) {
  const calculatedGrade = calculateECGrade(ec);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">{ec.name}</h4>
          <div className="flex items-center gap-2 mt-1">
            {ec.ects && (
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                {ec.ects} ECTS
              </span>
            )}
            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
              Coef. {ec.coef}
            </span>
          </div>
        </div>
        <div className="text-right ml-4">
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {formatGrade(calculatedGrade)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">average</div>
        </div>
      </div>
      
      <div className="space-y-2">
        {ec.assessments.map((assessment, index) => (
          <AssessmentRow
            key={index}
            assessment={assessment}
            onGradeChange={(grade) => onAssessmentGradeChange(index, grade)}
          />
        ))}
      </div>
    </div>
  );
}