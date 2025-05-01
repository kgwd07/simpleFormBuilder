import { create } from 'zustand';
import { Form, FormResponse } from '@/models/forms';

interface FormsState {
  forms: Form[];
  responses: { [formId: string]: FormResponse[] };
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchForms: () => Promise<void>;
  fetchResponses: (formId: string) => Promise<void>;
  addForm: (form: Form) => Promise<Form | null>;
  updateForm: (form: Form) => Promise<Form | null>;
  deleteForm: (formId: string) => Promise<boolean>;
  addResponse: (response: FormResponse) => Promise<FormResponse | null>;
  getFormResponses: (formId: string) => FormResponse[];
  clearResponses: (formId: string) => Promise<boolean>;
}

export const useFormsStore = create<FormsState>((set, get) => ({
  forms: [],
  responses: {},
  isLoading: false,
  error: null,
  
  fetchForms: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/forms');
      
      if (!response.ok) {
        throw new Error('Failed to fetch forms');
      }
      
      const forms = await response.json();
      
      // Transform dates from strings to Date objects
      const processedForms = forms.map((form: any) => ({
        ...form,
        createdAt: new Date(form.createdAt),
        updatedAt: new Date(form.updatedAt),
      }));
      
      set({ forms: processedForms, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      console.error('Error fetching forms:', error);
    }
  },
  
  fetchResponses: async (formId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/forms/${formId}/responses`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch responses');
      }
      
      const fetchedResponses = await response.json();
      
      // Process responses
      const processedResponses = fetchedResponses.map((res: any) => ({
        id: res.id,
        formId: res.formId,
        createdAt: new Date(res.createdAt),
        answers: res.answers.map((ans: any) => ({
          questionId: ans.questionId,
          // Try to parse JSON values
          value: (() => {
            try {
              return JSON.parse(ans.value);
            } catch {
              return ans.value;
            }
          })(),
        })),
      }));
      
      set((state) => ({
        responses: {
          ...state.responses,
          [formId]: processedResponses,
        },
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      console.error('Error fetching responses:', error);
    }
  },
  
  addForm: async (form) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/forms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create form');
      }
      
      const createdForm = await response.json();
      
      // Process dates
      const processedForm = {
        ...createdForm,
        createdAt: new Date(createdForm.createdAt),
        updatedAt: new Date(createdForm.updatedAt),
      };
      
      set((state) => ({
        forms: [...state.forms, processedForm],
        isLoading: false,
      }));
      
      return processedForm;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      console.error('Error creating form:', error);
      return null;
    }
  },
  
  updateForm: async (form) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/forms/${form.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update form');
      }
      
      const updatedForm = await response.json();
      
      // Process dates
      const processedForm = {
        ...updatedForm,
        createdAt: new Date(updatedForm.createdAt),
        updatedAt: new Date(updatedForm.updatedAt),
      };
      
      set((state) => ({
        forms: state.forms.map((f) => 
          f.id === form.id ? processedForm : f
        ),
        isLoading: false,
      }));
      
      return processedForm;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      console.error('Error updating form:', error);
      return null;
    }
  },
  
  deleteForm: async (formId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/forms/${formId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete form');
      }
      
      set((state) => {
        // Create a new responses object without the formId key
        const newResponses = { ...state.responses };
        delete newResponses[formId];
        
        return {
          forms: state.forms.filter((f) => f.id !== formId),
          responses: newResponses,
          isLoading: false,
        };
      });
      
      return true;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      console.error('Error deleting form:', error);
      return false;
    }
  },
  
  addResponse: async (response) => {
    set({ isLoading: true, error: null });
    try {
      const apiResponse = await fetch(`/api/forms/${response.formId}/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(response),
      });
      
      if (!apiResponse.ok) {
        throw new Error('Failed to submit response');
      }
      
      const createdResponse = await apiResponse.json();
      
      // Process response
      const processedResponse = {
        ...createdResponse,
        createdAt: new Date(createdResponse.createdAt),
        answers: createdResponse.answers.map((ans: any) => ({
          questionId: ans.questionId,
          value: (() => {
            try {
              return JSON.parse(ans.value);
            } catch {
              return ans.value;
            }
          })(),
        })),
      };
      
      set((state) => {
        const updatedForms = state.forms.map((form) => 
          form.id === response.formId 
            ? { ...form, responseCount: form.responseCount + 1 }
            : form
        );
        
        const formResponses = state.responses[response.formId] || [];
        
        return {
          forms: updatedForms,
          responses: {
            ...state.responses,
            [response.formId]: [...formResponses, processedResponse],
          },
          isLoading: false,
        };
      });
      
      return processedResponse;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      console.error('Error submitting response:', error);
      return null;
    }
  },
  
  getFormResponses: (formId) => {
    return get().responses[formId] || [];
  },
  
  clearResponses: async (formId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/forms/${formId}/responses`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to clear responses');
      }
      
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
          responses: newResponses,
          isLoading: false,
        };
      });
      
      return true;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      console.error('Error clearing responses:', error);
      return false;
    }
  },
}));