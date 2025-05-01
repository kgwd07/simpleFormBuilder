"use client";

import React, { useEffect, useState } from "react";
import { use } from "react"; // Import the use function
import { useRouter } from "next/navigation";
import { useFormBuilderStore } from "@/store/formBuilderStore";
import { useFormsStore } from "@/store/formsStore";
import { Question, QuestionType, FormResponse, Answer } from "@/models/forms";
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
  // Use React.use() to unwrap the params Promise
  //@ts-ignore
  const unwrappedParams = use(params);
  //@ts-ignore
  const id = unwrappedParams.id;

  // Form data from FormBuilderStore (API-based)
  const loadFormById = useFormBuilderStore((state) => state.loadFormById);
  const currentForm = useFormBuilderStore((state) => state.currentForm);
  const isFormLoading = useFormBuilderStore((state) => state.isLoading);
  const formError = useFormBuilderStore((state) => state.error);

  // Response handling from FormsStore (API-based)
  const addResponse = useFormsStore((state) => state.addResponse);
  const isResponseLoading = useFormsStore((state) => state.isLoading);
  const responseError = useFormsStore((state) => state.error);

  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(
    null
  );
  const [currentProgress, setCurrentProgress] = useState(0);

  const validateCurrentQuestion = (questionId: string): boolean => {
    // Find the question
    const question = currentForm.questions.find((q) => q.id === questionId);

    if (!question) return true; // If question not found, consider it valid

    // Clear previous error for this question
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[questionId];
      return newErrors;
    });

    // Check if the question is required and not answered
    if (
      question.isRequired &&
      (answers[questionId] === null || answers[questionId] === "")
    ) {
      // Set error for this question
      setErrors((prev) => ({
        ...prev,
        [questionId]: "This question is required",
      }));
      return false;
    }

    return true; // Question is valid
  };

  // Load form data from API when component mounts
  useEffect(() => {
    if (!id) {
      router.push("/dashboard");
      return;
    }

    const fetchForm = async () => {
      try {
        await loadFormById(id);
      } catch (error) {
        console.error("Error fetching form:", error);
        router.push("/dashboard");
      }
    };

    fetchForm();
  }, [id, loadFormById, router]); // Removed currentForm.questions from dependencies

  // Initialize answers when form is loaded
  useEffect(() => {
    if (currentForm.questions && currentForm.questions.length > 0) {
      // Initialize answers object
      const initialAnswers: Record<string, any> = {};
      currentForm.questions.forEach((question) => {
        initialAnswers[question.id] = null;
      });
      setAnswers(initialAnswers);
    }
  }, [currentForm.questions]); // Only depends on questions changing

  // Set the first question as selected when form loads
  useEffect(() => {
    if (
      currentForm.questions &&
      currentForm.questions.length > 0 &&
      !selectedQuestionId
    ) {
      // Set the first question as selected
      setSelectedQuestionId(currentForm.questions[0].id);
    }
  }, [currentForm.questions, selectedQuestionId]);

  // Calculate progress whenever answers change
  useEffect(() => {
    if (currentForm.questions && currentForm.questions.length > 0) {
      // Calculate progress
      const answeredQuestions = Object.values(answers).filter(
        (value) => value !== null && value !== ""
      ).length;
      const totalQuestions = currentForm.questions.length;
      setCurrentProgress((answeredQuestions / totalQuestions) * 100);
    }
  }, [answers, currentForm.questions]);

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

  const handleSubmit = async () => {
    if (!currentForm || !currentForm.questions) return;

    // Validate required questions
    const newErrors: Record<string, string> = {};
    currentForm.questions.forEach((question) => {
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
    const formattedAnswers: Answer[] = Object.entries(answers)
      .filter(([_, value]) => value !== null && value !== "")
      .map(([questionId, value]) => ({
        questionId,
        value,
      }));

    // Create response object
    const response: FormResponse = {
      id: `temp_${nanoid()}`, // This will be replaced by MongoDB ObjectId
      formId: currentForm.id,
      createdAt: new Date(),
      answers: formattedAnswers,
    };

    // Submit response to the API
    try {
      const result = await addResponse(response);
      if (result) {
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error("Error submitting form response:", error);
    }
  };

  const getSelectedQuestion = () => {
    if (!currentForm || !currentForm.questions || !selectedQuestionId)
      return null;
    return (
      currentForm.questions.find((q) => q.id === selectedQuestionId) || null
    );
  };

  const renderQuestionInput = (question: Question) => {
    switch (question.type) {
      case QuestionType.ShortText:
        return (
          <Input
            id={`question-${question.id}`}
            value={answers[question.id] || ""}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder={
              (question as any).placeholder || "Type your answer here"
            }
            error={errors[question.id]}
          />
        );
      case QuestionType.Dropdown:
        return (
          <Select
            id={`question-${question.id}`}
            value={answers[question.id] || ""}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            options={((question as any).options || []).map((opt: any) => ({
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

  // Show loading state
  if (isFormLoading || isResponseLoading) {
    return (
      <div className="container mx-auto p-6 text-center">
        <p className="text-gray-600">Loading form...</p>
      </div>
    );
  }

  // Show error state
  if (formError || responseError) {
    return (
      <div className="container mx-auto p-6 text-center">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-6 text-center">
            <h1 className="text-gray-600 text-2xl font-bold mb-4">Error</h1>
            <p className="text-red-500 mb-6">{formError || responseError}</p>
            <Button onClick={() => router.push("/dashboard")}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show submission confirmation
  if (isSubmitted) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-6 text-center">
            <h1 className="text-gray-600 text-2xl font-bold mb-4">
              Thank You!
            </h1>
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

  // Check if form is available
  if (
    !currentForm ||
    !currentForm.questions ||
    currentForm.questions.length === 0
  ) {
    return (
      <div className="container mx-auto p-6 text-center">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-6 text-center">
            <h1 className="text-gray-600 text-2xl font-bold mb-4">
              Form Not Found
            </h1>
            <p className="text-gray-600 mb-6">
              The form you're looking for is not available.
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
    <div className="container mx-auto p-6 flex flex-col min-h-screen">
      {/* Header Card with Title and Progress */}
      <Card className="mb-6 shadow-md border-t-4 border-blue-500 shrink-0">
        <CardHeader className="p-5 border-b">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
            <div>
              <h1 className="text-gray-800 text-2xl font-bold">
                {currentForm.title}
              </h1>
              {currentForm.description && (
                <p className="text-gray-600 mt-1">{currentForm.description}</p>
              )}
            </div>
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg text-sm font-medium shadow-sm border border-green-200 flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              Response Will Be Saved
            </div>
          </div>
        </CardHeader>

        {/* Enhanced Progress bar */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-gray-700">
              Your progress
            </span>
            <span className="text-sm font-bold text-blue-600">
              {Math.round(currentProgress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${currentProgress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span className="font-medium">
              {
                Object.values(answers).filter((v) => v !== null && v !== "")
                  .length
              }{" "}
              of {currentForm.questions.length} answered
            </span>
            <span>
              {currentForm.questions.length -
                Object.values(answers).filter((v) => v !== null && v !== "")
                  .length}{" "}
              remaining
            </span>
          </div>
        </div>
      </Card>

      {/* Main content grid with improved styling */}
      <div
        className="grid grid-cols-12 gap-6 mb-6"
        style={{ minHeight: "calc(100vh - 220px)" }}
      >
        {/* Column 1: Question Navigator - Enhanced */}
        <div className="col-span-12 lg:col-span-3 flex flex-col">
          <Card className="h-full flex flex-col overflow-hidden shadow-md">
            <CardHeader className="p-4 border-b bg-gray-50 shrink-0">
              <h2 className="text-gray-700 text-lg font-medium flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
                Questions
              </h2>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden">
              <div className="h-full overflow-y-auto pb-4">
                {currentForm.questions.map((question, index) => {
                  const isAnswered =
                    answers[question.id] !== null &&
                    answers[question.id] !== "";
                  const hasError = errors[question.id] !== undefined;

                  return (
                    <div
                      key={question.id}
                      onClick={() => setSelectedQuestionId(question.id)}
                      className={`
        p-4 border-b cursor-pointer flex items-center transition-colors duration-200
        ${
          selectedQuestionId === question.id
            ? "bg-blue-50 border-l-4 border-blue-500"
            : "hover:bg-gray-50 border-l-4 border-transparent"
        }
        ${hasError ? "bg-red-50 hover:bg-red-50 border-l-4 border-red-500" : ""}
        ${isAnswered ? "hover:bg-green-50" : ""}
      `}
                    >
                      <div
                        className={`
        min-w-[2rem] w-8 h-8 rounded-full flex items-center justify-center mr-3 font-bold shadow-sm text-base shrink-0
        ${
          isAnswered
            ? "bg-green-100 text-green-700 ring-2 ring-green-200"
            : "bg-gray-100 text-gray-600"
        }
        ${hasError ? "bg-red-100 text-red-700 ring-2 ring-red-200" : ""}
        ${
          selectedQuestionId === question.id && !isAnswered && !hasError
            ? "bg-blue-100 text-blue-700 ring-2 ring-blue-200"
            : ""
        }
      `}
                      >
                        {isAnswered ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        ) : (
                          <span className="flex items-center justify-center leading-none">
                            {index + 1}
                          </span>
                        )}
                      </div>
                      <div className="flex-grow overflow-hidden">
                        <div
                          className={`font-medium truncate ${
                            hasError
                              ? "text-red-700"
                              : isAnswered
                              ? "text-green-700"
                              : selectedQuestionId === question.id
                              ? "text-blue-700"
                              : "text-gray-700"
                          }`}
                        >
                          {question.title}
                          {question.isRequired && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Column 2: Current Question - Enhanced with single error message */}
        <div className="col-span-12 lg:col-span-9 flex flex-col">
          <Card className="h-full flex flex-col overflow-hidden shadow-md border border-gray-200">
            <CardHeader className="p-4 border-b bg-gray-50 shrink-0">
              <h2 className="text-gray-700 text-lg font-medium flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Answer Questions
              </h2>
            </CardHeader>
            <CardContent className="p-6 flex-1 overflow-auto bg-white">
              {selectedQuestion ? (
                <div className="space-y-6 pb-4 w-full">
                  {" "}
                  {/* Removed max-w-3xl mx-auto, added w-full */}
                  <div className="flex items-start mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 w-full">
                    <div className="min-w-[2.5rem] w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mr-4 font-bold shadow-sm ring-2 ring-blue-200 text-lg shrink-0">
                      <span className="flex items-center justify-center leading-none">
                        {currentForm.questions.findIndex(
                          (q) => q.id === selectedQuestion.id
                        ) + 1}
                      </span>
                    </div>
                    <div className="flex-1 w-full">
                      {" "}
                      {/* Added flex-1 and w-full */}
                      <div className="font-semibold text-gray-800 text-lg">
                        {selectedQuestion.title}
                        {selectedQuestion.isRequired && (
                          <span className="text-red-500 ml-1 text-sm">*</span>
                        )}
                      </div>
                      {selectedQuestion.description && (
                        <div className="text-gray-600 mt-1 text-sm">
                          {selectedQuestion.description}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-1 w-full">
                    {" "}
                    {/* Added w-full */}
                    {renderQuestionInput(selectedQuestion)}
                  </div>
                  <div className="flex justify-between mt-10 pt-4 border-t w-full">
                    {" "}
                    {/* Added w-full */}
                    <Button
                      variant="outline"
                      onClick={() => {
                        const currentIndex = currentForm.questions.findIndex(
                          (q) => q.id === selectedQuestion.id
                        );
                        if (currentIndex > 0) {
                          setSelectedQuestionId(
                            currentForm.questions[currentIndex - 1].id
                          );
                        }
                      }}
                      isDisabled={
                        currentForm.questions.findIndex(
                          (q) => q.id === selectedQuestion.id
                        ) === 0 || isResponseLoading
                      }
                      className="px-6 py-2 flex items-center gap-2 cursor-pointer"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                      </svg>
                      Previous
                    </Button>
                    <Button
                      onClick={() => {
                        const currentIndex = currentForm.questions.findIndex(
                          (q) => q.id === selectedQuestion.id
                        );

                        // First validate the current question
                        if (validateCurrentQuestion(selectedQuestion.id)) {
                          // Only proceed if validation passes
                          if (currentIndex < currentForm.questions.length - 1) {
                            setSelectedQuestionId(
                              currentForm.questions[currentIndex + 1].id
                            );
                          } else {
                            handleSubmit();
                          }
                        }
                      }}
                      isDisabled={isResponseLoading}
                      className={`px-6 py-2 flex items-center gap-2 cursor-pointer ${
                        currentForm.questions.findIndex(
                          (q) => q.id === selectedQuestion.id
                        ) ===
                        currentForm.questions.length - 1
                          ? "bg-green-600 hover:bg-green-700"
                          : ""
                      }`}
                    >
                      {isResponseLoading ? (
                        <>
                          <svg
                            className="animate-spin h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Processing...
                        </>
                      ) : currentForm.questions.findIndex(
                          (q) => q.id === selectedQuestion.id
                        ) ===
                        currentForm.questions.length - 1 ? (
                        <>
                          Submit
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M22 2v16h-5.5"></path>
                            <path d="M2 13.5V22h16v-8.5"></path>
                            <path d="M18 2 7 13"></path>
                            <path d="m2 18 5 4 4-5"></path>
                          </svg>
                        </>
                      ) : (
                        <>
                          Next
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                          </svg>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mx-auto mb-4 text-gray-400"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                  <p className="text-lg font-medium">No question selected</p>
                  <p className="mt-1">
                    Please select a question from the list to begin answering
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
