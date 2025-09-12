import React, { useState } from 'react';
import { syllabusData } from './data/syllabusData';
import { UE } from './types/syllabus';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Navbar } from './components/Navbar';
import { UESection } from './components/UESection';

function App() {
  const [ues, setUes] = useLocalStorage<UE[]>('gradeData', syllabusData);

  const handleReset = () => {
    setUes(syllabusData);
  };

  const handleAssessmentGradeChange = (
    ueIndex: number, 
    ecIndex: number, 
    assessmentIndex: number, 
    grade: number | undefined
  ) => {
    setUes(prev => prev.map((ue, uIdx) => 
      uIdx === ueIndex 
        ? {
            ...ue,
            ecs: ue.ecs.map((ec, ecIdx) => 
              ecIdx === ecIndex 
                ? {
                    ...ec,
                    assessments: ec.assessments.map((assessment, aIdx) => 
                      aIdx === assessmentIndex 
                        ? { ...assessment, grade }
                        : assessment
                    )
                  }
                : ec
            )
          }
        : ue
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Navbar ues={ues} onReset={handleReset} />
      
      <div className="pt-24">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="space-y-6">
            {ues.map((ue, ueIndex) => (
              <UESection
                key={ueIndex}
                ue={ue}
                onAssessmentGradeChange={(ecIndex, assessmentIndex, grade) => 
                  handleAssessmentGradeChange(ueIndex, ecIndex, assessmentIndex, grade)
                }
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;