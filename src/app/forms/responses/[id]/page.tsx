// src/app/forms/responses/[id]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFormsStore } from '@/store/formsStore';
import { Form, Question, FormResponse, Answer } from '@/models/forms';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface ResponsesPageProps {
  params: {
    id: string;
  };
}

export default function ResponsesPage({ params }: ResponsesPageProps) {
  // Use React.use() to unwrap the params Promise
  //@ts-ignore
  const { id } = React.use(params);
  const router = useRouter();
  
  const forms = useFormsStore((state) => state.forms);
  const responses = useFormsStore((state) => state.responses);
  
  const [form, setForm] = useState<Form | null>(null);
  const [formResponses, setFormResponses] = useState<FormResponse[]>([]);
  
  useEffect(() => {
    const foundForm = forms.find(f => f.id === id);
    if (foundForm) {
      setForm(foundForm);
      setFormResponses(responses[id] || []);
    } else {
      router.push('/dashboard');
    }
  }, [id, forms, responses, router]);
  
  // Helper function to find answer for a specific question
  const getAnswerForQuestion = (response: FormResponse, questionId: string) => {
    const answer = response.answers.find(a => a.questionId === questionId);
    return answer ? answer.value : '-';
  };
  
  if (!form) {
    return (
      <div className="container mx-auto p-6 text-center">
        <p>Loading form responses...</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-600">{form.title} - Responses</h1>
          <p className="text-gray-500">
            {formResponses.length} {formResponses.length === 1 ? 'response' : 'responses'} collected
          </p>
        </div>
        <div className="space-x-2">
          {/* <Button
            variant="outline"
            onClick={() => router.push(`/forms/${id}`)}
          >
            Edit Form
          </Button> */}
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={() => router.push('/dashboard')}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-0">
          {formResponses.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No responses collected yet for this form.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-200">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submission Date
                    </th>
                    {form.questions.map((question) => (
                      <th 
                        key={question.id} 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {question.title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {formResponses.map((response, index) => (
                    <tr key={response.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(response.createdAt).toLocaleString()}
                      </td>
                      {form.questions.map((question) => (
                        <td 
                          key={question.id} 
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                        >
                          {typeof getAnswerForQuestion(response, question.id) === 'object' 
                            ? JSON.stringify(getAnswerForQuestion(response, question.id))
                            : String(getAnswerForQuestion(response, question.id))}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* {formResponses.length > 0 && (
        <div className="mt-4 flex justify-end">
          <Button
            variant="outline"
            onClick={() => {
              // Here you could add export functionality (CSV, etc.)
              alert('Export functionality could be added here');
            }}
          >
            Export Data
          </Button>
        </div>
      )} */}
    </div>
  );
}