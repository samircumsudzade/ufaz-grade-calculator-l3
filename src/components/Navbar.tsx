import React from 'react';
import { UE } from '../types/syllabus';
import { calculateOverallGrade, calculateCollectableGrade, formatGrade } from '../utils/gradeCalculations';
import { Menu } from './Menu';

interface NavbarProps {
  ues: UE[];
  onReset: () => void;
}

export function Navbar({ ues, onReset }: NavbarProps) {
  const projectedGrade = calculateOverallGrade(ues);
  const collectableGrade = calculateCollectableGrade(ues);

  const completedAssessments = ues.reduce((sum, ue) => 
    sum + ue.ecs.reduce((ecSum, ec) => 
      ecSum + ec.assessments.filter(a => a.grade !== undefined).length, 0
    ), 0
  );
  const totalAssessments = ues.reduce((sum, ue) => 
    sum + ue.ecs.reduce((ecSum, ec) => ecSum + ec.assessments.length, 0), 0
  );


  return (
    <div className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-50 transition-colors">
      <div className="max-w-4xl mx-auto px-4">
        <div className="py-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Menu onReset={onReset} />
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Calculator: L3S1</h1>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {completedAssessments}/{totalAssessments} completed
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400">Projected Grade</span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900 dark:text-white">{formatGrade(projectedGrade)}/20</span>
                <span className="text-gray-500 dark:text-gray-500">•</span>
                <span className="text-gray-600 dark:text-gray-400">{formatGrade(collectableGrade)} collectable</span>
              </div>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-md h-2 overflow-hidden">
              <div 
                className="bg-blue-600 dark:bg-blue-400 h-2 transition-all duration-300"
                style={{ width: `${(projectedGrade / 20) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}