import React from 'react';
import { UE } from '../types/syllabus';
import { calculateOverallMidProgressProjectedGrade, formatGrade } from '../utils/gradeCalculations';
import { Menu } from './Menu';

interface NavbarProps {
  ues: UE[];
  onReset: () => void;
}

export function Navbar({ ues, onReset }: NavbarProps) {
  const projectedGrade = calculateOverallMidProgressProjectedGrade(ues);

  const completedAssessments = ues.reduce((sum, ue) => 
    sum + ue.ecs.reduce((ecSum, ec) => 
      ecSum + ec.assessments.filter(a => a.grade !== undefined).length, 0
    ), 0
  );
  const totalAssessments = ues.reduce((sum, ue) => 
    sum + ue.ecs.reduce((ecSum, ec) => ecSum + ec.assessments.length, 0), 0
  );

  // Calculate collectable grade (remaining ECTS * 20)
  const completedUEs = ues.filter(ue => 
    ue.ecs.every(ec => 
      ec.assessments.every(a => a.grade !== undefined)
    )
  );
  const completedECTS = completedUEs.reduce((sum, ue) => sum + ue.ects, 0);
  const totalECTS = ues.reduce((sum, ue) => sum + ue.ects, 0);
  const collectableGrade = (totalECTS - completedECTS) * 20;

  return (
    <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="py-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Menu onReset={onReset} />
              <h1 className="text-xl font-semibold text-gray-900">Calculator: L3S1</h1>
            </div>
            <div className="text-sm text-gray-500">
              {completedAssessments}/{totalAssessments} completed
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600">Mid-Progress Projected Grade</span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{formatGrade(projectedGrade)}/20</span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-600">{collectableGrade} collectable</span>
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-md h-2 overflow-hidden">
              <div 
                className="bg-blue-600 h-2 transition-all duration-300"
                style={{ width: `${projectedGrade ? (projectedGrade / 20) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}