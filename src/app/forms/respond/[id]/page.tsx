// "use client";

// import React, { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { useFormsStore } from "@/store/formsStore";
// import {
//   Form,
//   Question,
//   QuestionType,
//   FormResponse,
//   Answer,
// } from "@/models/forms";
// import { Button } from "@/components/ui/Button";
// import { Input } from "@/components/ui/Input";
// import { Select } from "@/components/ui/Select";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardFooter,
// } from "@/components/ui/Card";
// import { nanoid } from "nanoid";

// interface RespondFormPageProps {
//   params: {
//     id: string;
//   };
// }

// export default function RespondFormPage({ params }: RespondFormPageProps) {
//   const router = useRouter();
//   //@ts-ignore
//   const { id } = React.use(params);

//   const forms = useFormsStore((state) => state.forms);
//   const addResponse = useFormsStore((state) => state.addResponse);

//   const [form, setForm] = useState<Form | null>(null);
//   const [answers, setAnswers] = useState<Record<string, any>>({});
//   const [errors, setErrors] = useState<Record<string, string>>({});
//   const [isSubmitted, setIsSubmitted] = useState(false);

//   useEffect(() => {
//     const foundForm = forms.find((form) => form.id === id);
//     if (foundForm) {
//       setForm(foundForm);
//       // Initialize answers object
//       const initialAnswers: Record<string, any> = {};
//       foundForm.questions.forEach((question) => {
//         initialAnswers[question.id] = null;
//       });
//       setAnswers(initialAnswers);
//     } else {
//       router.push("/dashboard");
//     }
//   }, [id, forms, router]);

//   const handleAnswerChange = (questionId: string, value: any) => {
//     setAnswers((prev) => ({
//       ...prev,
//       [questionId]: value,
//     }));

//     // Clear error if exists
//     if (errors[questionId]) {
//       setErrors((prev) => {
//         const newErrors = { ...prev };
//         delete newErrors[questionId];
//         return newErrors;
//       });
//     }
//   };

//   // const handleSubmit = () => {
//   //   if (!form) return;

//   //   // Validate required questions
//   //   const newErrors: Record<string, string> = {};
//   //   form.questions.forEach((question) => {
//   //     if (question.isRequired && (answers[question.id] === null || answers[question.id] === '')) {
//   //       newErrors[question.id] = 'This question is required';
//   //     }
//   //   });

//   //   if (Object.keys(newErrors).length > 0) {
//   //     setErrors(newErrors);
//   //     return;
//   //   }

//   //   // Format answers for submission
//   //   const formattedAnswers: Answer[] = Object.entries(answers).map(([questionId, value]) => ({
//   //     questionId,
//   //     value,
//   //   }));

//   //   // Create response
//   //   const response: FormResponse = {
//   //     id: nanoid(),
//   //     formId: form.id,
//   //     createdAt: new Date(),
//   //     answers: formattedAnswers,
//   //   };

//   //   // Submit response
//   //   addResponse(response);
//   //   setIsSubmitted(true);
//   // };

//   const handleSubmit = () => {
//     if (!form) return;

//     // Validate required questions
//     const newErrors: Record<string, string> = {};
//     form.questions.forEach((question) => {
//       if (
//         question.isRequired &&
//         (answers[question.id] === null || answers[question.id] === "")
//       ) {
//         newErrors[question.id] = "This question is required";
//       }
//     });

//     if (Object.keys(newErrors).length > 0) {
//       setErrors(newErrors);
//       return;
//     }

//     // Format answers for submission
//     const formattedAnswers: Answer[] = Object.entries(answers).map(
//       ([questionId, value]) => ({
//         questionId,
//         value,
//       })
//     );

//     // Create response
//     const response: FormResponse = {
//       id: nanoid(),
//       formId: form.id,
//       createdAt: new Date(),
//       answers: formattedAnswers,
//     };

//     // Save the response
//     addResponse(response);
//     setIsSubmitted(true);
//   };

//   if (!form) {
//     return (
//       <div className="container mx-auto p-6 text-center">
//         <p>Loading form...</p>
//       </div>
//     );
//   }

//   if (isSubmitted) {
//     return (
//       <div className="container mx-auto p-6">
//         <Card className="max-w-2xl mx-auto">
//           <CardContent className="p-6 text-center">
//             <h1 className="text-gray-600 text-2xl font-bold mb-4">Thank You!</h1>
//             <p className="text-gray-600 mb-6">
//               Your response has been submitted successfully.
//             </p>
//             <Button onClick={() => router.push("/dashboard")}>
//               Back to Dashboard
//             </Button>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto p-6">
//       <Card className="max-w-2xl mx-auto">
//         <CardHeader className="p-6 border-b">
//           <div className="flex justify-between items-center">
//             <h1 className="text-gray-600 text-2xl font-bold">{form.title}</h1>
//             <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
//               Response Will Be Saved
//             </div>
//           </div>
//           {form.description && (
//             <p className="text-gray-600 mt-2">{form.description}</p>
//           )}
//         </CardHeader>

//         <CardContent className="p-6">
//           {form.questions.map((question, index) => (
//             <div key={question.id} className="mb-6">
//               <div className="flex items-start mb-2">
//                 <span className=" text-gray-600 mr-2 font-medium">{index + 1}.</span>
//                 <div>
//                   <div className="font-medium text-gray-600">
//                     {question.title}
//                     {question.isRequired && (
//                       <span className="text-red-500 ml-1">*</span>
//                     )}
//                   </div>
//                   {question.description && (
//                     <div className="text-sm text-gray-500 mb-1">
//                       {question.description}
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {question.type === QuestionType.ShortText && (
//                 <Input
//                   id={`question-${question.id}`}
//                   value={answers[question.id] || ""}
//                   onChange={(e) =>
//                     handleAnswerChange(question.id, e.target.value)
//                   }
//                   placeholder={
//                     (question as any).placeholder || "Type your answer here"
//                   }
//                   error={errors[question.id]}
//                 />
//               )}

//               {question.type === QuestionType.Dropdown && (
//                 <Select
//                   id={`question-${question.id}`}
//                   value={answers[question.id] || ""}
//                   onChange={(e) =>
//                     handleAnswerChange(question.id, e.target.value)
//                   }
//                   options={(question as any).options.map((opt: any) => ({
//                     value: opt.value,
//                     label: opt.value,
//                   }))}
//                   placeholder="Select an option"
//                   error={errors[question.id]}
//                   // className="text-gray-600"
//                 />
//               )}
//             </div>
//           ))}
//         </CardContent>

//         <CardFooter className="p-6 border-t">
//           <div className="flex justify-end w-full">
//             <Button onClick={handleSubmit}>Submit</Button>
//           </div>
//         </CardFooter>
//       </Card>
//     </div>
//   );
// }







"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormsStore } from "@/store/formsStore";
import {
  Form,
  Question,
  QuestionType,
  FormResponse,
  Answer,
} from "@/models/forms";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/Card";
import { nanoid } from "nanoid";

interface RespondFormPageProps {
  params: {
    id: string;
  };
}

export default function RespondFormPage({ params }: RespondFormPageProps) {
  const router = useRouter();
  //@ts-ignore
  const { id } = React.use(params);

  const forms = useFormsStore((state) => state.forms);
  const addResponse = useFormsStore((state) => state.addResponse);

  const [form, setForm] = useState<Form | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [currentProgress, setCurrentProgress] = useState(0);

  useEffect(() => {
    const foundForm = forms.find((form) => form.id === id);
    if (foundForm) {
      setForm(foundForm);
      // Initialize answers object
      const initialAnswers: Record<string, any> = {};
      foundForm.questions.forEach((question) => {
        initialAnswers[question.id] = null;
      });
      setAnswers(initialAnswers);
      
      // Set first question as selected by default
      if (foundForm.questions.length > 0) {
        setSelectedQuestionId(foundForm.questions[0].id);
      }
    } else {
      router.push("/dashboard");
    }
  }, [id, forms, router]);

  useEffect(() => {
    if (form) {
      // Calculate progress
      const answeredQuestions = Object.values(answers).filter(value => 
        value !== null && value !== "").length;
      const totalQuestions = form.questions.length;
      setCurrentProgress((answeredQuestions / totalQuestions) * 100);
    }
  }, [answers, form]);

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
      if (
        question.isRequired &&
        (answers[question.id] === null || answers[question.id] === "")
      ) {
        newErrors[question.id] = "This question is required";
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      
      // Focus the first question with an error
      const firstErrorQuestionId = Object.keys(newErrors)[0];
      setSelectedQuestionId(firstErrorQuestionId);
      
      return;
    }

    // Format answers for submission
    const formattedAnswers: Answer[] = Object.entries(answers).map(
      ([questionId, value]) => ({
        questionId,
        value,
      })
    );

    // Create response
    const response: FormResponse = {
      id: nanoid(),
      formId: form.id,
      createdAt: new Date(),
      answers: formattedAnswers,
    };

    // Save the response
    addResponse(response);
    setIsSubmitted(true);
  };

  const getSelectedQuestion = () => {
    if (!form || !selectedQuestionId) return null;
    return form.questions.find(q => q.id === selectedQuestionId) || null;
  };

  const renderQuestionInput = (question: Question) => {
    switch (question.type) {
      case QuestionType.ShortText:
        return (
          <Input
            id={`question-${question.id}`}
            value={answers[question.id] || ""}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder={(question as any).placeholder || "Type your answer here"}
            error={errors[question.id]}
          />
        );
      case QuestionType.Dropdown:
        return (
          <Select
            id={`question-${question.id}`}
            value={answers[question.id] || ""}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            options={(question as any).options.map((opt: any) => ({
              value: opt.value,
              label: opt.value,
            }))}
            placeholder="Select an option"
            error={errors[question.id]}
          />
        );
      default:
        return <div>Unsupported question type</div>;
    }
  };

  if (!form) {
    return (
      <div className="container mx-auto p-6 text-center">
        <p>Loading form...</p>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-6 text-center">
            <h1 className="text-gray-600 text-2xl font-bold mb-4">Thank You!</h1>
            <p className="text-gray-600 mb-6">
              Your response has been submitted successfully.
            </p>
            <Button onClick={() => router.push("/dashboard")}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedQuestion = getSelectedQuestion();

  return (
    <div className="container mx-auto p-6">
      <Card className="mb-6">
        <CardHeader className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h1 className="text-gray-600 text-2xl font-bold">{form.title}</h1>
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              Response Will Be Saved
            </div>
          </div>
          {form.description && (
            <p className="text-gray-600 mt-2">{form.description}</p>
          )}
        </CardHeader>
        
        {/* Progress bar */}
        <div className="px-6 py-2 bg-gray-50">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${currentProgress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{Object.values(answers).filter(v => v !== null && v !== "").length} of {form.questions.length} answered</span>
            <span>{Math.round(currentProgress)}% complete</span>
          </div>
        </div>
      </Card>
      
      <div className="grid grid-cols-12 gap-6">
        {/* Column 1: Question Navigator */}
        <div className="col-span-12 lg:col-span-3">
          <Card className="sticky top-6">
            <CardHeader className="p-4 border-b">
              <h2 className="text-gray-600 text-lg font-medium">Questions</h2>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[60vh] overflow-y-auto">
                {form.questions.map((question, index) => {
                  const isAnswered = answers[question.id] !== null && answers[question.id] !== "";
                  const hasError = errors[question.id] !== undefined;
                  
                  return (
                    <div 
                      key={question.id}
                      onClick={() => setSelectedQuestionId(question.id)}
                      className={`
                        p-4 border-b cursor-pointer flex items-center
                        ${selectedQuestionId === question.id ? 'bg-blue-50' : 'hover:bg-gray-50'}
                        ${hasError ? 'bg-red-50 hover:bg-red-50' : ''}
                      `}
                    >
                      <div className={`
                        w-6 h-6 rounded-full flex items-center justify-center mr-3 text-sm
                        ${isAnswered ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-600'}
                        ${hasError ? 'bg-red-100 text-red-600' : ''}
                      `}>
                        {isAnswered ? '✓' : index + 1}
                      </div>
                      <div className="flex-grow overflow-hidden">
                        <div className={`font-medium truncate ${hasError ? 'text-red-600' : 'text-gray-600'}`}>
                          {question.title}
                          {question.isRequired && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </div>
                        {hasError && (
                          <div className="text-xs text-red-500">
                            {errors[question.id]}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
            <CardFooter className="p-4 border-t">
              <Button 
                onClick={handleSubmit}
                className="w-full"
              >
                Submit Form
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Column 2: Current Question */}
        <div className="col-span-12 lg:col-span-9">
          <Card className="sticky top-6">
            <CardHeader className="p-4 border-b">
              <h2 className="text-gray-600 text-lg font-medium">Answer Questions</h2>
            </CardHeader>
            <CardContent className="p-6">
              {selectedQuestion ? (
                <div className="space-y-4">
                  <div className="flex items-start mb-4">
                    <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                      {form.questions.findIndex(q => q.id === selectedQuestion.id) + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-700 text-lg">
                        {selectedQuestion.title}
                        {selectedQuestion.isRequired && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </div>
                      {selectedQuestion.description && (
                        <div className="text-gray-500 mt-1">
                          {selectedQuestion.description}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {renderQuestionInput(selectedQuestion)}
                  
                  {/* {errors[selectedQuestion.id] && (
                    <div className="text-red-500 text-sm mt-2">
                      {errors[selectedQuestion.id]}
                    </div>
                  )} */}
                  
                  <div className="flex justify-between mt-8">
                    <Button
                      variant="outline"
                      onClick={() => {
                        const currentIndex = form.questions.findIndex(q => q.id === selectedQuestion.id);
                        if (currentIndex > 0) {
                          setSelectedQuestionId(form.questions[currentIndex - 1].id);
                        }
                      }}
                      isDisabled={form.questions.findIndex(q => q.id === selectedQuestion.id) === 0}
                    >
                      Previous
                    </Button>
                    
                    <Button
                      onClick={() => {
                        const currentIndex = form.questions.findIndex(q => q.id === selectedQuestion.id);
                        if (currentIndex < form.questions.length - 1) {
                          setSelectedQuestionId(form.questions[currentIndex + 1].id);
                        } else {
                          handleSubmit();
                        }
                      }}
                    >
                      {form.questions.findIndex(q => q.id === selectedQuestion.id) === form.questions.length - 1 
                        ? 'Submit' 
                        : 'Next'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No question selected
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Column 3: Form Summary */}
        {/* <div className="col-span-12 lg:col-span-3">
          <Card className="sticky top-6">
            <CardHeader className="p-4 border-b">
              <h2 className="text-gray-600 text-lg font-medium">Form Summary</h2>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm text-gray-500 mb-1">Your Progress</h3>
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${currentProgress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 whitespace-nowrap">
                      {Math.round(currentProgress)}%
                    </span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm text-gray-500 mb-2">Questions Overview</h3>
                  <div className="space-y-1 max-h-[40vh] overflow-y-auto">
                    {form.questions.map((question, index) => {
                      const isAnswered = answers[question.id] !== null && answers[question.id] !== "";
                      const hasError = errors[question.id] !== undefined;
                      
                      return (
                        <div 
                          key={question.id}
                          onClick={() => setSelectedQuestionId(question.id)}
                          className={`
                            p-2 rounded cursor-pointer flex items-center text-sm
                            ${selectedQuestionId === question.id ? 'bg-blue-50' : ''}
                            ${hasError ? 'bg-red-50' : ''}
                          `}
                        >
                          <div className={`
                            w-5 h-5 rounded-full flex items-center justify-center mr-2 text-xs
                            ${isAnswered ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-600'}
                            ${hasError ? 'bg-red-100 text-red-600' : ''}
                          `}>
                            {isAnswered ? '✓' : index + 1}
                          </div>
                          <div className="truncate flex-grow">
                            {question.title}
                          </div>
                          {isAnswered && (
                            <div className="ml-2 text-xs text-gray-500 max-w-[100px] truncate">
                              {answers[question.id]}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {Object.keys(errors).length > 0 && (
                  <div className="mt-4 bg-red-50 p-3 rounded-md">
                    <h3 className="text-sm text-red-600 font-medium mb-1">
                      There are {Object.keys(errors).length} errors to fix:
                    </h3>
                    <ul className="list-disc pl-5 text-xs text-red-600">
                      {Object.keys(errors).map(questionId => {
                        const question = form.questions.find(q => q.id === questionId);
                        return (
                          <li key={questionId} className="cursor-pointer" onClick={() => setSelectedQuestionId(questionId)}>
                            {question?.title}: {errors[questionId]}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="p-4 border-t">
              <Button 
                onClick={handleSubmit}
                className="w-full"
                //@ts-ignore
                variant={Object.keys(errors).length > 0 ? "outline" : "default"}
              >
                {Object.keys(errors).length > 0 
                  ? `Fix ${Object.keys(errors).length} errors before submitting` 
                  : 'Submit Form'}
              </Button>
            </CardFooter>
          </Card>
        </div> */}
      </div>
    </div>
  );
}