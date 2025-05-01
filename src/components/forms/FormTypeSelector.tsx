// import React from 'react';
// import { QuestionType } from '@/models/forms';
// import { useFormBuilderStore } from '@/store/formBuilderStore';

// interface QuestionTypeOption {
//   type: QuestionType;
//   label: string;
//   icon: React.ReactNode;
//   category: 'inputs' | 'choices';
// }

// const questionTypes: QuestionTypeOption[] = [
//   // Text Input
//   {
//     type: QuestionType.ShortText,
//     label: 'Text Field',
//     icon: <span className="text-teal-500">¶</span>,
//     category: 'inputs',
//   },
  
//   // Dropdown
//   {
//     type: QuestionType.Dropdown,
//     label: 'Dropdown',
//     icon: <span className="text-red-500">▼</span>,
//     category: 'choices',
//   },
// ];

// interface FormTypeSelectorProps {
//   onSelect: () => void; // Add this prop
// }

// export const FormTypeSelector: React.FC<FormTypeSelectorProps> = ({ onSelect }) => {
//   const addQuestion = useFormBuilderStore((state) => state.addQuestion);

//    // Create a handler that adds the question and calls onSelect
//    const handleSelectQuestionType = (type: QuestionType) => {
//     addQuestion(type);
//     if (onSelect) {
//       onSelect(); // Call the callback to close the modal
//     }
//   };
  
//   // Group question types by category
//   const questionTypesByCategory = questionTypes.reduce((acc, question) => {
//     if (!acc[question.category]) {
//       acc[question.category] = [];
//     }
//     acc[question.category].push(question);
//     return acc;
//   }, {} as Record<string, QuestionTypeOption[]>);
  
//   const categoryLabels: Record<string, string> = {
//     'inputs': 'Inputs',
//     'choices': 'Choices',
//   };
  
//   return (
//     <div className="bg-white p-4">
//       <div className="flex flex-row space-x-4">
//         {Object.entries(questionTypesByCategory).map(([category, questions]) => (
//           <div key={category} className="flex-1">
//             <h3 className="text-sm font-medium text-gray-700 mb-2 text-left">
//               {categoryLabels[category]}
//             </h3>
//             <div className="w-full">
//               {questions.map((question) => (
//                 <button
//                   key={question.type}
//                   onClick={() => handleSelectQuestionType(question.type)}
//                   className="w-full flex items-center p-2 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors text-left mb-2 cursor-pointer"
//                 >
//                   <div className="w-6 h-6 flex items-center justify-center mr-2">
//                     {question.icon}
//                   </div>
//                   <span className="text-sm text-gray-900 font-medium">
//                     {question.label}
//                   </span>
//                 </button>
//               ))}
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

import React from 'react';
import { Question, QuestionType } from '@/models/forms';
import { useFormBuilderStore } from '@/store/formBuilderStore';

interface QuestionTypeOption {
  type: QuestionType;
  label: string;
  icon: React.ReactNode;
  category: 'inputs' | 'choices';
}

const questionTypes: QuestionTypeOption[] = [
  // Text Input
  {
    type: QuestionType.ShortText,
    label: 'Text Field',
    icon: <span className="text-teal-500">¶</span>,
    category: 'inputs',
  },
  
  // Dropdown
  {
    type: QuestionType.Dropdown,
    label: 'Dropdown',
    icon: <span className="text-red-500">▼</span>,
    category: 'choices',
  },
];

interface FormTypeSelectorProps {
  onSelect: () => void;
  onQuestionCreated?: (question: Question) => void; // New prop for handling the new question
}

export const FormTypeSelector: React.FC<FormTypeSelectorProps> = ({ 
  onSelect,
  onQuestionCreated 
}) => {
  const addQuestion = useFormBuilderStore((state) => state.addQuestion);

  // Create a handler that adds the question and calls onSelect
  const handleSelectQuestionType = (type: QuestionType) => {
    const newQuestion = addQuestion(type);
    
    // If we have a handler for the new question, call it
    if (onQuestionCreated && newQuestion) {
      onQuestionCreated(newQuestion);
    }
    
    // Call the callback to close the modal
    if (onSelect) {
      onSelect();
    }
  };
  
  // Group question types by category
  const questionTypesByCategory = questionTypes.reduce((acc, question) => {
    if (!acc[question.category]) {
      acc[question.category] = [];
    }
    acc[question.category].push(question);
    return acc;
  }, {} as Record<string, QuestionTypeOption[]>);
  
  const categoryLabels: Record<string, string> = {
    'inputs': 'Inputs',
    'choices': 'Choices',
  };
  
  return (
    <div className="bg-white p-4">
      <div className="flex flex-row space-x-4">
        {Object.entries(questionTypesByCategory).map(([category, questions]) => (
          <div key={category} className="flex-1">
            <h3 className="text-sm font-medium text-gray-700 mb-2 text-left">
              {categoryLabels[category]}
            </h3>
            <div className="w-full">
              {questions.map((question) => (
                <button
                  key={question.type}
                  onClick={() => handleSelectQuestionType(question.type)}
                  className="w-full flex items-center p-2 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors text-left mb-2 cursor-pointer"
                >
                  <div className="w-6 h-6 flex items-center justify-center mr-2">
                    {question.icon}
                  </div>
                  <span className="text-sm text-gray-900 font-medium">
                    {question.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};