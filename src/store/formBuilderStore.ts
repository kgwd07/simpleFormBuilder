import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { 
  Question, 
  QuestionType, 
  Form, 
  FormStatus,
  DropdownQuestion,
  Option,
  BaseQuestion
} from '@/models/forms';

interface FormBuilderState {
  currentForm: Form;
  
  // Actions
  setFormTitle: (title: string) => void;
  setFormDescription: (description: string) => void;
  setFormStatus: (status: FormStatus) => void;
  
  // Question management
  addQuestion: (type: QuestionType) => void;
  updateQuestion: (questionId: string, questionData: Partial<Question>) => void;
  removeQuestion: (questionId: string) => void;
  reorderQuestions: (sourceIndex: number, destinationIndex: number) => void; // New function
  
  // Options management for dropdown
  addOption: (questionId: string, value: string) => void;
  updateOption: (questionId: string, optionId: string, newValue: string) => void;
  removeOption: (questionId: string, optionId: string) => void;
  
  // Form management
  resetForm: () => void;
  loadForm: (form: Form) => void;
}

// Create initial empty form
const createEmptyForm = (): Form => ({
  id: nanoid(),
  title: 'New Form',
  description: '',
  status: FormStatus.Draft,
  createdAt: new Date(),
  updatedAt: new Date(),
  questions: [],
  responseCount: 0,
});

export const useFormBuilderStore = create<FormBuilderState>((set) => ({
  currentForm: createEmptyForm(),
  
  setFormTitle: (title) => 
    set((state) => ({
      currentForm: { 
        ...state.currentForm, 
        title,
        updatedAt: new Date() 
      }
    })),
    
  setFormDescription: (description) => 
    set((state) => ({
      currentForm: { 
        ...state.currentForm, 
        description,
        updatedAt: new Date() 
      }
    })),
    
  setFormStatus: (status) => 
    set((state) => ({
      currentForm: { 
        ...state.currentForm, 
        status,
        updatedAt: new Date() 
      }
    })),
  
  addQuestion: (type) => 
    set((state) => {
      const newOrder = state.currentForm.questions.length;
      
      // Create base question
      const baseQuestion: BaseQuestion = {
        id: nanoid(),
        formId: state.currentForm.id,
        type,
        title: `Q${newOrder + 1}`,
        description: '',
        isRequired: false,
        order: newOrder,
      };
      
      // Extend with type-specific properties
      let newQuestion: Question;
      
      switch (type) {
        case QuestionType.Dropdown:
          newQuestion = {
            ...baseQuestion,
            type: QuestionType.Dropdown,
            options: [{ id: nanoid(), value: 'Option 1' }],
            allowCustomInput: false,
          } as DropdownQuestion;
          break;
          
        case QuestionType.ShortText:
          newQuestion = {
            ...baseQuestion,
            type: QuestionType.ShortText,
            placeholder: 'Type your answer here...',
          };
          break;
          
        default:
          newQuestion = {
            ...baseQuestion,
            type: QuestionType.ShortText,
            placeholder: 'Type your answer here...',
          };
      }
      
      return {
        currentForm: {
          ...state.currentForm,
          questions: [...state.currentForm.questions, newQuestion],
          updatedAt: new Date(),
        }
      };
    }),
  
  updateQuestion: (questionId, questionData) => 
    set((state:any) => ({
      currentForm: {
        ...state.currentForm,
        questions: state.currentForm.questions.map((q:any) => 
          q.id === questionId ? { ...q, ...questionData } : q
        ),
        updatedAt: new Date(),
      }
    })),
    
  removeQuestion: (questionId) => 
    set((state) => {
      // Remove the question
      const filteredQuestions = state.currentForm.questions.filter(
        (q) => q.id !== questionId
      );
      
      // Reorder remaining questions
      const reorderedQuestions = filteredQuestions.map((q, idx) => ({
        ...q,
        order: idx,
        title: q.title.startsWith('Q') ? `Q${idx + 1}` : q.title
      }));
      
      return {
        currentForm: {
          ...state.currentForm,
          questions: reorderedQuestions,
          updatedAt: new Date(),
        }
      };
    }),
    
  // Add reorderQuestions function
  reorderQuestions: (sourceIndex, destinationIndex) => 
    set((state) => {
      // Create a copy of questions array
      const updatedQuestions = [...state.currentForm.questions];
      
      // Remove the item from the source index
      const [movedQuestion] = updatedQuestions.splice(sourceIndex, 1);
      
      // Insert it at the destination index
      updatedQuestions.splice(destinationIndex, 0, movedQuestion);
      
      // Update order and numbering
      const reorderedQuestions = updatedQuestions.map((q, idx) => ({
        ...q,
        order: idx,
        title: q.title.startsWith('Q') ? `Q${idx + 1}` : q.title
      }));
      
      return {
        currentForm: {
          ...state.currentForm,
          questions: reorderedQuestions,
          updatedAt: new Date(),
        }
      };
    }),
    
  addOption: (questionId, value) => 
    set((state) => {
      const newOption: Option = {
        id: nanoid(),
        value
      };
      
      return {
        currentForm: {
          ...state.currentForm,
          questions: state.currentForm.questions.map((q) => {
            if (q.id !== questionId) return q;
            
            if (q.type === QuestionType.Dropdown) {
              return {
                ...q,
                options: [...(q as DropdownQuestion).options, newOption]
              };
            }
            
            return q;
          }),
          updatedAt: new Date(),
        }
      };
    }),
    
  updateOption: (questionId, optionId, newValue) => 
    set((state) => ({
      currentForm: {
        ...state.currentForm,
        questions: state.currentForm.questions.map((q) => {
          if (q.id !== questionId) return q;
          
          if (q.type === QuestionType.Dropdown) {
            return {
              ...q,
              options: (q as DropdownQuestion).options.map((opt) =>
                opt.id === optionId ? { ...opt, value: newValue } : opt
              )
            };
          }
          
          return q;
        }),
        updatedAt: new Date(),
      }
    })),
    
  removeOption: (questionId, optionId) => 
    set((state) => ({
      currentForm: {
        ...state.currentForm,
        questions: state.currentForm.questions.map((q) => {
          if (q.id !== questionId) return q;
          
          if (q.type === QuestionType.Dropdown) {
            const typedQ = q as DropdownQuestion;
            // Ensure we don't remove the last option
            if (typedQ.options.length <= 1) return q;
            
            return {
              ...q,
              options: typedQ.options.filter((opt) => opt.id !== optionId)
            };
          }
          
          return q;
        }),
        updatedAt: new Date(),
      }
    })),
    
  resetForm: () => 
    set(() => ({
      currentForm: createEmptyForm()
    })),
    
  loadForm: (form) => 
    set(() => ({
      currentForm: form
    })),
}));