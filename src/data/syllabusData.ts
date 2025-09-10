import { SyllabusData } from '../types/syllabus';

export const syllabusData: SyllabusData = [
  {
    "UE": "Mathematics 5",
    "ects": 3,
    "coef": 3,
    "ecs": [
      {
        "name": "Ordinary and partial differential equations",
        "coef": 4,
        "assessments": [
          { "label": "First written exam", "coef": 1, "duration": "1h30" },
          { "label": "Second written exam", "coef": 1, "duration": "1h30" },
          { "label": "Third written exam", "coef": 2, "duration": "1h30" }
        ]
      }
    ]
  },
  {
    "UE": "Physical Chemistry 5",
    "ects": 10,
    "coef": 11,
    "ecs": [
      {
        "name": "Polymers and formulation",
        "coef": 1,
        "assessments": [
          { "label": "Written exam", "coef": 1, "duration": "1h30" }
        ]
      },
      {
        "name": "Analytical chemistry",
        "coef": 1,
        "assessments": [
          { "label": "Written exam", "coef": 1, "duration": "1h30" }
        ]
      },
      {
        "name": "Experimental chemistry 5",
        "coef": 1,
        "assessments": [
          { "label": "Reports/Behavior", "coef": 1 }
        ]
      },
      {
        "name": "Applied Chemistry",
        "coef": 1,
        "assessments": [
          { "label": "Written exam", "coef": 1, "duration": "2h00" }
        ]
      }
    ]
  },
  {
    "UE": "Chemical engineering 5",
    "ects": 11,
    "coef": 9,
    "ecs": [
      {
        "name": "Systems dynamics and regulation",
        "coef": 2,
        "assessments": [
          { "label": "Multiple choice questions online", "coef": 1, "duration": "1h30" }
        ]
      },
      {
        "name": "Catalysis and environnement",
        "coef": 2,
        "assessments": [
          { "label": "4 homeworks", "coef": 2 },
          { "label": "Written exam", "coef": 3, "duration": "1h30" }
        ]
      },
      {
        "name": "Experimental chemical engineering 5",
        "coef": 2,
        "assessments": [
          { "label": "Reports/Behavior", "coef": 1 }
        ]
      },
      {
        "name": "Process simulation",
        "coef": 1,
        "assessments": [
          { "label": "Report", "coef": 1 }
        ]
      },
      {
        "name": "Chemical Engineering project 1",
        "coef": 1,
        "assessments": [
          { "label": "Report", "coef": 1 }
        ]
      }
    ]
  },
  {
    "UE": "Language 5",
    "ects": 3,
    "coef": 3,
    "ecs": [
      {
        "name": "English or French",
        "coef": 1,
        "assessments": [
          { "label": "Oral evaluation", "coef": 3, "duration": "0h10" },
          { "label": "Written production", "coef": 2 },
          { "label": "Written exam", "coef": 3, "duration": "1h30" }
        ]
      }
    ]
  },
  {
    "UE": "Professional preparation 2",
    "ects": 3,
    "coef": 3,
    "ecs": [
      {
        "name": "Scientific writing",
        "coef": 1,
        "assessments": [
          { "label": "First written exam", "coef": 1, "duration": "1h30" },
          { "label": "Second written exam", "coef": 1, "duration": "1h30" },
          { "label": "Third written exam", "coef": 1, "duration": "1h30" }
        ]
      }
    ]
  }
];