import React from 'react';
import { Assessment } from '../types/syllabus';
import { GradeInput } from './GradeInput';

interface AssessmentRowProps {
  assessment: Assessment;
  onGradeChange: (grade: number | undefined) => void;
}

export function AssessmentRow({ assessment, onGradeChange }: AssessmentRowProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 truncate">{assessment.label}</div>
        <div className="flex items-center gap-2 mt-1">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
            Coef. {assessment.coef}
          </span>
          {assessment.duration && (
            <span className="text-xs text-gray-500">{assessment.duration}</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 ml-4">
        <GradeInput
          value={assessment.grade}
          onChange={onGradeChange}
        />
        <span className="text-sm text-gray-500">/20</span>
      </div>
    </div>
  );
}