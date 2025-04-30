import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Form, FormResponse } from '@/models/forms';

interface FormsState {
  forms: Form[];
  responses: { [formId: string]: FormResponse[] };
  
  // Actions
  addForm: (form: Form) => void;
  updateForm: (form: Form) => void;
  deleteForm: (formId: string) => void;
  addResponse: (response: FormResponse) => void;
  getFormResponses: (formId: string) => FormResponse[];
  clearResponses: (formId: string) => void;

}

// Create the forms store with local persistence
export const useFormsStore = create<FormsState>()(
  persist(
    (set, get) => ({
      forms: [],
      responses: {},
      
      addForm: (form) => 
        set((state) => ({
          forms: [...state.forms, form]
        })),
        
      updateForm: (form) => 
        set((state) => ({
          forms: state.forms.map((f) => 
            f.id === form.id ? form : f
          )
        })),
        
        deleteForm: (formId) => 
          set((state) => {
            // Create a new responses object without the formId key
            const newResponses = { ...state.responses };
            delete newResponses[formId];
        
            return {
              // Remove the form from the forms array
              forms: state.forms.filter((f) => f.id !== formId),
              // Remove all responses for this form
              responses: newResponses
            };
          }),
        
      addResponse: (response) => 
        set((state) => {
          const formResponses = state.responses[response.formId] || [];
          
          // Update response count in the form
          const updatedForms = state.forms.map((form) => 
            form.id === response.formId 
              ? { ...form, responseCount: form.responseCount + 1 } 
              : form
          );
          
          return {
            forms: updatedForms,
            responses: {
              ...state.responses,
              [response.formId]: [...formResponses, response]
            }
          };
        }),
        
      getFormResponses: (formId) => {
        return get().responses[formId] || [];
      },
      clearResponses: (formId) => 
        set((state) => {
          // Create a new responses object without the formId key
          const newResponses = { ...state.responses };
          delete newResponses[formId];
      
          return {
            forms: state.forms.map(form => 
              form.id === formId 
                ? { ...form, responseCount: 0 } 
                : form
            ),
            responses: newResponses
          };
        }),
    }),
    {
      name: 'forms-storage',
    }
  )
);