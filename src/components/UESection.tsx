import React from 'react';
import { UE } from '../types/syllabus';
import { ECCard } from './ECCard';
import { calculateUEGrade, formatGrade } from '../utils/gradeCalculations';

interface UESectionProps {
  ue: UE;
  onAssessmentGradeChange: (ecIndex: number, assessmentIndex: number, grade: number | undefined) => void;
}

export function UESection({ ue, onAssessmentGradeChange }: UESectionProps) {
  const calculatedGrade = calculateUEGrade(ue);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">{ue.UE}</h3>
            <div className="flex items-center gap-3 mt-1">
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                {ue.ects} ECTS
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                Coef. {ue.coef}
              </span>
            </div>
          </div>
          <div className="text-right ml-4">
            <div className="text-2xl font-semibold text-gray-900">
              {formatGrade(calculatedGrade)}
            </div>
            <div className="text-xs text-gray-500">out of 20</div>
          </div>
        </div>
      </div>
      
      <div className="divide-y divide-gray-100">
        {ue.ecs.map((ec, ecIndex) => (
          <ECCard
            key={ecIndex}
            ec={ec}
            onAssessmentGradeChange={(assessmentIndex, grade) => 
              onAssessmentGradeChange(ecIndex, assessmentIndex, grade)
            }
          />
        ))}
      </div>
    </div>
  );
}