import React from 'react';
import { UE } from '../types/syllabus';
import { calculateOverallGrade, formatGrade } from '../utils/gradeCalculations';

interface NavbarProps {
  ues: UE[];
}

export function Navbar({ ues }: NavbarProps) {
  const currentGrade = calculateOverallGrade(ues, false);
  const projectedGrade = calculateOverallGrade(ues, true);

  const completedAssessments = ues.reduce((sum, ue) => 
    sum + ue.ecs.reduce((ecSum, ec) => 
      ecSum + ec.assessments.filter(a => a.grade !== undefined).length, 0
    ), 0
  );
  const totalAssessments = ues.reduce((sum, ue) => 
    sum + ue.ecs.reduce((ecSum, ec) => ecSum + ec.assessments.length, 0), 0
  );

  const progressPercentage = (completedAssessments / totalAssessments) * 100;

  return (
    <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-semibold text-gray-900">Calculator: L3S1(CE)</h1>
            <div className="text-sm text-gray-500">
              {completedAssessments}/{totalAssessments} completed
            </div>
          </div>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">Current Grade</span>
                <span className="font-medium text-gray-900">{formatGrade(currentGrade)}/20</span>
              </div>
              <div className="w-full bg-gray-100 rounded-md h-2 overflow-hidden">
                <div 
                  className="bg-gray-800 h-2 transition-all duration-300"
                  style={{ width: `${currentGrade ? (currentGrade / 20) * 100 : 0}%` }}
                />
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">Projected</span>
                <span className="font-medium text-gray-700">{formatGrade(projectedGrade)}/20</span>
              </div>
              <div className="w-full bg-gray-100 rounded-md h-2 overflow-hidden">
                <div 
                  className="bg-gray-500 h-2 transition-all duration-300"
                  style={{ width: `${projectedGrade ? (projectedGrade / 20) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}