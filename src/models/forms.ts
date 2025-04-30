// Question types - only the two we need
export enum QuestionType {
    ShortText = 'SHORT_TEXT',
    Dropdown = 'DROPDOWN',
  }
  
  // Form status
  export enum FormStatus {
    Draft = 'DRAFT',
    Published = 'PUBLISHED',
  }
  
  // Option for dropdown questions
  export interface Option {
    id: string;
    value: string;
  }
  
  // Base question interface
  export interface BaseQuestion {
    id: string;
    formId: string;
    type: QuestionType;
    title: string;
    description?: string;
    isRequired: boolean;
    order: number;
  }
  
  // Dropdown question
  export interface DropdownQuestion extends BaseQuestion {
    type: QuestionType.Dropdown;
    options: Option[];
    allowCustomInput: boolean;
  }
  
  // Text question
  export interface TextQuestion extends BaseQuestion {
    type: QuestionType.ShortText;
    placeholder?: string;
  }
  
  // Question union type
  export type Question = TextQuestion | DropdownQuestion;
  
  // Form interface
  export interface Form {
    id: string;
    title: string;
    description?: string;
    status: FormStatus;
    createdAt: Date;
    updatedAt: Date;
    questions: Question[];
    responseCount: number;
  }
  
  // Form response
  export interface FormResponse {
    id: string;
    formId: string;
    createdAt: Date;
    answers: Answer[];
  }
  
  // Answer to a question
  export interface Answer {
    questionId: string;
    value: string | string[] | null;
  }