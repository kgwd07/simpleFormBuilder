'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFormBuilderStore } from '@/store/formBuilderStore';
import { useFormsStore } from '@/store/formsStore';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';

interface ResponsesPageProps {
  params: {
    id: string;
  };
}

export default function ResponsesPage({ params }: ResponsesPageProps) {
  // Use React.use() to unwrap the params Promise
  // @ts-ignore
  const { id } = React.use(params);
  const router = useRouter();
  
  // Get form data
  const loadFormById = useFormBuilderStore((state) => state.loadFormById);
  const currentForm = useFormBuilderStore((state) => state.currentForm);
  const isFormLoading = useFormBuilderStore((state) => state.isLoading);
  const formError = useFormBuilderStore((state) => state.error);
  
  // Get responses data
  const { responses, isLoading: isResponsesLoading, error: responsesError, fetchResponses } = useFormsStore();
  const formResponses = responses[id] || [];
  
  // Load form and responses when component mounts
  useEffect(() => {
    const loadData = async () => {
      const success = await loadFormById(id);
      if (success) {
        fetchResponses(id);
      } else {
        router.push('/dashboard');
      }
    };
    
    loadData();
  }, [id, loadFormById, fetchResponses, router]);
  
  // Helper function to find answer for a specific question
  const getAnswerForQuestion = (responseId: string, questionId: string) => {
    const response = formResponses.find(r => r.id === responseId);
    if (!response) return '-';
    
    const answer = response.answers.find(a => a.questionId === questionId);
    return answer ? answer.value : '-';
  };
  
  // Show loading state
  if (isFormLoading || isResponsesLoading) {
    return (
      <div className="container mx-auto p-6 text-center">
        <p className="text-gray-600">Loading data...</p>
      </div>
    );
  }
  
  // Show error state
  if (formError || responsesError) {
    return (
      <div className="container mx-auto p-6 text-center">
        <p className="text-red-500">Error: {formError || responsesError}</p>
        <Button className="mt-4 cursor-pointer" onClick={() => router.push('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-600">{currentForm.title} - Responses</h1>
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
            className='cursor-pointer'
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
                <thead className="bg-gray-300 ">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submission Date
                    </th>
                    {currentForm.questions.map((question) => (
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
                      {currentForm.questions.map((question) => (
                        <td 
                          key={question.id} 
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                        >
                          {typeof getAnswerForQuestion(response.id, question.id) === 'object' 
                            ? JSON.stringify(getAnswerForQuestion(response.id, question.id))
                            : String(getAnswerForQuestion(response.id, question.id))}
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
    </div>
  );
}