'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useFormsStore } from '@/store/formsStore';
import { Form, Question, QuestionType } from '@/models/forms';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/Card';

interface PreviewFormPageProps {
  params: {
    id: string;
  };
}

export default function PreviewFormPage({ params }: PreviewFormPageProps) {
  // Use React.use() to unwrap the params Promise as per your error message
  //@ts-ignore
  const { id } = React.use(params);
  const router = useRouter();
  
  const forms = useFormsStore((state) => state.forms);
  
  const [form, setForm] = React.useState<Form | null>(null);
  const [answers, setAnswers] = React.useState<Record<string, any>>({});
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  
  React.useEffect(() => {
    const foundForm = forms.find((form) => form.id === id);
    if (foundForm) {
      setForm(foundForm);
      // Initialize answers object
      const initialAnswers: Record<string, any> = {};
      foundForm.questions.forEach((question) => {
        initialAnswers[question.id] = null;
      });
      setAnswers(initialAnswers);
    } else {
      router.push('/dashboard');
    }
  }, [id, forms, router]);
  
  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
    
    // Clear error if exists
    if (errors[questionId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };
  
  const handleSubmit = () => {
    if (!form) return;
    
    // Validate required questions
    const newErrors: Record<string, string> = {};
    form.questions.forEach((question) => {
      if (question.isRequired && (answers[question.id] === null || answers[question.id] === '')) {
        newErrors[question.id] = 'This question is required';
      }
    });
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // In preview mode, don't save - just show a message
    alert('Preview mode: Form validated successfully, but responses are not saved in Preview mode.');
    router.push('/dashboard');
  };
  
  if (!form) {
    return (
      <div className="container mx-auto p-6 text-center">
        <p>Loading form...</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">{form.title}</h1>
            <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
              Preview Mode
            </div>
          </div>
          {form.description && (
            <p className="text-gray-600 mt-2">{form.description}</p>
          )}
        </CardHeader>
        
        <CardContent className="p-6">
          {form.questions.map((question, index) => (
            <div key={question.id} className="mb-6">
              <div className="flex items-start mb-2">
                <span className="mr-2 font-medium">{index + 1}.</span>
                <div>
                  <div className="font-medium">
                    {question.title}
                    {question.isRequired && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </div>
                  {question.description && (
                    <div className="text-sm text-gray-500 mb-1">
                      {question.description}
                    </div>
                  )}
                </div>
              </div>
              
              {question.type === QuestionType.ShortText && (
                <Input
                  id={`question-${question.id}`}
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  placeholder={(question as any).placeholder || 'Type your answer here'}
                  error={errors[question.id]}
                />
              )}
              
              {question.type === QuestionType.Dropdown && (
                <Select
                  id={`question-${question.id}`}
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  options={(question as any).options.map((opt: any) => ({
                    value: opt.value,
                    label: opt.value,
                  }))}
                  placeholder="Select an option"
                  error={errors[question.id]}
                />
              )}
            </div>
          ))}
        </CardContent>
        
        <CardFooter className="p-6 border-t">
          <div className="flex justify-between w-full">
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard')}
            >
              Back
            </Button>
            <div className="flex space-x-2">
              <Button 
                variant="primary" 
                onClick={handleSubmit}
              >
                Submit (Preview Only)
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.push(`/forms/respond/${id}`)}
              >
                Go to Respond Mode
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}