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

  // Load form data from API when component mounts - fixed to avoid infinite calls
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

  // Initialize answers when form is loaded - separate effect
  useEffect(() => {
    if (currentForm.questions && currentForm.questions.length > 0) {
      // Initialize answers object only if not already initialized
      const allQuestionsAnswered = currentForm.questions.every(
        (question) => question.id in answers
      );

      if (!allQuestionsAnswered) {
        const initialAnswers: Record<string, any> = {};
        currentForm.questions.forEach((question) => {
          initialAnswers[question.id] = null;
        });
        setAnswers(initialAnswers);

        // Set first question as selected by default if not already set
        if (!selectedQuestionId) {
          setSelectedQuestionId(currentForm.questions[0].id);
        }
      }
    }
  }, [currentForm.questions, answers, selectedQuestionId]);

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
    <div className="container mx-auto p-6">
      <Card className="mb-6">
        <CardHeader className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h1 className="text-gray-600 text-2xl font-bold">
              {currentForm.title}
            </h1>
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              Response Will Be Saved
            </div>
          </div>
          {currentForm.description && (
            <p className="text-gray-600 mt-2">{currentForm.description}</p>
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
            <span>
              {
                Object.values(answers).filter((v) => v !== null && v !== "")
                  .length
              }{" "}
              of {currentForm.questions.length} answered
            </span>
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
                        p-4 border-b cursor-pointer flex items-center
                        ${
                          selectedQuestionId === question.id
                            ? "bg-blue-50"
                            : "hover:bg-gray-50"
                        }
                        ${hasError ? "bg-red-50 hover:bg-red-50" : ""}
                      `}
                    >
                      <div
                        className={`
                        w-6 h-6 rounded-full flex items-center justify-center mr-3 text-sm
                        ${
                          isAnswered
                            ? "bg-green-100 text-green-600"
                            : "bg-gray-200 text-gray-600"
                        }
                        ${hasError ? "bg-red-100 text-red-600" : ""}
                      `}
                      >
                        {isAnswered ? "✓" : index + 1}
                      </div>
                      <div className="flex-grow overflow-hidden">
                        <div
                          className={`font-medium truncate ${
                            hasError ? "text-red-600" : "text-gray-600"
                          }`}
                        >
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
                isDisabled={isResponseLoading}
              >
                {isResponseLoading ? "Submitting..." : "Submit Form"}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Column 2: Current Question */}
        <div className="col-span-12 lg:col-span-9">
          <Card className="sticky top-6">
            <CardHeader className="p-4 border-b">
              <h2 className="text-gray-600 text-lg font-medium">
                Answer Questions
              </h2>
            </CardHeader>
            <CardContent className="p-6">
              {selectedQuestion ? (
                <div className="space-y-4">
                  <div className="flex items-start mb-4">
                    <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                      {currentForm.questions.findIndex(
                        (q) => q.id === selectedQuestion.id
                      ) + 1}
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

                  <div className="flex justify-between mt-8">
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
                    >
                      Previous
                    </Button>

                    {/* <Button
                      onClick={() => {
                        const currentIndex = currentForm.questions.findIndex(q => q.id === selectedQuestion.id);
                        if (currentIndex < currentForm.questions.length - 1) {
                          setSelectedQuestionId(currentForm.questions[currentIndex + 1].id);
                        } else {
                          handleSubmit();
                        }
                      }}
                      isDisabled={isResponseLoading}
                    >
                      {isResponseLoading ? 'Processing...' : 
                        (currentForm.questions.findIndex(q => q.id === selectedQuestion.id) === currentForm.questions.length - 1 
                          ? 'Submit' 
                          : 'Next')}
                    </Button> */}

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
                    >
                      {isResponseLoading
                        ? "Processing..."
                        : currentForm.questions.findIndex(
                            (q) => q.id === selectedQuestion.id
                          ) ===
                          currentForm.questions.length - 1
                        ? "Submit"
                        : "Next"}
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
      </div>
    </div>
  );
}
