"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useFormBuilderStore } from "@/store/formBuilderStore";
import { useFormsStore } from "@/store/formsStore";
import { FormStatus, Question, QuestionType } from "@/models/forms";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { FormTypeSelector } from "@/components/forms/FormTypeSelector";
import { QuestionCard } from "@/components/forms/QuestionCard";
import { Modal } from "@/components/ui/Modal";
import { TextFieldEditor } from "@/components/forms/TextFieldEditor";
import { DropdownEditor } from "@/components/forms/DropdownEditor";

export default function EditFormPage({ params }: any) {
  // Using React.use() to unwrap the params Promise
  // @ts-expect-error
  const { id } = React.use(params);
  const router = useRouter();
  const [isTypeSelectorOpen, setIsTypeSelectorOpen] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const selectedQuestionIdRef = useRef<string | null>(null);

  const forms = useFormsStore((state) => state.forms);
  const responses = useFormsStore((state) => state.responses);
  const updateForm = useFormsStore((state) => state.updateForm);
  const clearResponses = useFormsStore((state) => state.clearResponses);

  const currentForm = useFormBuilderStore((state) => state.currentForm);
  const loadForm = useFormBuilderStore((state) => state.loadForm);
  const setFormTitle = useFormBuilderStore((state) => state.setFormTitle);
  const setFormDescription = useFormBuilderStore(
    (state) => state.setFormDescription
  );
  const setFormStatus = useFormBuilderStore((state) => state.setFormStatus);
  const removeQuestion = useFormBuilderStore((state) => state.removeQuestion);
  const reorderQuestions = useFormBuilderStore((state) => state.reorderQuestions);
  const addForm = useFormsStore((state) => state.addForm);
  const resetForm = useFormBuilderStore((state) => state.resetForm);

  // Check if form has any responses
  const hasResponses = responses[id] && responses[id].length > 0;

  // Load form data on component mount
  useEffect(() => {
    const form = forms.find((form) => form.id === id);
    if (form) {
      loadForm(form);
    } else {
      router.push("/dashboard");
    }
  }, [id, forms, loadForm, router]);

  // Maintain selected question across re-renders
  useEffect(() => {
    if (selectedQuestionIdRef.current) {
      // Try to find the question with the same ID after re-render
      const question = currentForm.questions.find(q => q.id === selectedQuestionIdRef.current);
      if (question) {
        setSelectedQuestion(question);
      } else {
        // If the question was removed, clear the selection
        setSelectedQuestion(null);
        selectedQuestionIdRef.current = null;
      }
    } else if (currentForm?.questions?.length > 0 && !selectedQuestion) {
      // If no question is selected but there are questions, select the last one
      const lastQuestion = currentForm.questions[currentForm.questions.length - 1];
      setSelectedQuestion(lastQuestion);
      selectedQuestionIdRef.current = lastQuestion.id;
    }
  }, [currentForm, selectedQuestion]);

  // Update the ref when selected question changes
  useEffect(() => {
    if (selectedQuestion) {
      selectedQuestionIdRef.current = selectedQuestion.id;
    } else {
      selectedQuestionIdRef.current = null;
    }
  }, [selectedQuestion]);

  const handleUpdateForm = (status: any) => {
    if (hasResponses && !showWarning) {
      setShowWarning(true);
      setPendingStatus(status); // Store the status they selected
      return;
    }

    if (status || pendingStatus) {
      // Use the provided status or the pending one
      setFormStatus(status || pendingStatus);
    }

    

    updateForm({
      ...currentForm,
      status: status || pendingStatus,
      updatedAt: new Date(),
    });

    // Clear all responses for this form
    if (hasResponses) {
      clearResponses(id);
    }

    router.push("/dashboard");
  };

  // Handle selecting a question
  const handleSelectQuestion = (question: Question) => {
    setSelectedQuestion(question);
    selectedQuestionIdRef.current = question.id;
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    // This helps with Firefox
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
    
    // Add a dragging class to the element for visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.classList.add('bg-blue-50', 'opacity-50');
    }
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    // Add visual indicator for the drop target
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.classList.add('bg-gray-100', 'border-blue-300');
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Remove the visual indicator when leaving a potential drop target
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.classList.remove('bg-gray-100', 'border-blue-300');
    }
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    
    // Remove visual indicators
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.classList.remove('bg-gray-100', 'border-blue-300');
    }
    
    // Process the drop
    if (draggedIndex !== null && draggedIndex !== targetIndex) {
      reorderQuestions(draggedIndex, targetIndex);
    }
    
    setDraggedIndex(null);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    // Clean up any visual effects
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.classList.remove('bg-blue-50', 'opacity-50');
    }
    
    setDraggedIndex(null);
  };

  const renderQuestionSettings = () => {
    if (!selectedQuestion) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">Select a question to edit its settings</p>
        </div>
      );
    }

    switch (selectedQuestion.type) {
      case QuestionType.ShortText:
        return <TextFieldEditor question={selectedQuestion} />;
      case QuestionType.Dropdown:
        return <DropdownEditor question={selectedQuestion} />;
      default:
        return <div>Unsupported question type</div>;
    }
  };

  const renderQuestionPreview = (question: Question, index: number) => {
    switch (question.type) {
      case QuestionType.ShortText:
        return (
          <div className="mb-4">
            <div className="text-gray-600 font-medium">
              {index + 1}{". "}{question.title}
              {question.isRequired && <span className="text-red-500 ml-1">*</span>}
            </div>
            {question.description && (
              <div className="text-sm text-gray-500 mb-1">{question.description}</div>
            )}
            <input 
              type="text" 
              className="text-gray-500 w-full h-10 px-3 border border-gray-300 rounded mt-1" 
              placeholder={question.placeholder || ''}
              disabled
            />
          </div>
        );
      case QuestionType.Dropdown:
        return (
          <div className="mb-4">
            <div className="text-gray-600 font-medium">
              {index + 1}{". "}{question.title}
              {question.isRequired && <span className="text-red-500 ml-1">*</span>}
            </div>
            {question.description && (
              <div className="text-sm text-gray-500 mb-1">{question.description}</div>
            )}
            <select className="w-full h-10 px-3 border border-gray-300 rounded mt-1" disabled>
              <option value="">Select an option</option>
              {question.options?.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.value}
                </option>
              ))}
            </select>
          </div>
        );
      default:
        return <div>Unsupported question type</div>;
    }
  };
  
  return (
    <div className="container mx-auto p-6">
<Modal 
  isOpen={isTypeSelectorOpen} 
  onClose={() => setIsTypeSelectorOpen(false)}
  title="Add Question"
>
  <FormTypeSelector 
    onSelect={() => setIsTypeSelectorOpen(false)}
    onQuestionCreated={(newQuestion) => {
      // Immediately select the new question
      setSelectedQuestion(newQuestion);
      selectedQuestionIdRef.current = newQuestion.id;
    }}
  />
  <div className="mt-4 text-center">
    <Button
      variant="outline"
      className="cursor-pointer"
      onClick={() => setIsTypeSelectorOpen(false)}
    >
      Cancel
    </Button>
  </div>
</Modal>

      {/* Warning Modal for Responses */}
      {showWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md">
            <h3 className="text-xl font-bold mb-4 text-red-600">Warning</h3>
            <p className="mb-4">
              Editing this form will delete all existing responses (
              {responses[id]?.length || 0} responses). This action cannot be
              undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowWarning(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  setShowWarning(false);
                  handleUpdateForm(null);
                }}
              >
                Delete Responses & Save
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-gray-600 text-2xl font-bold">
          <Input
            id="form-description"
            label=""
            value={currentForm.title || ''}
            onChange={(e) => setFormTitle(e.target.value)}
            placeholder="form title"
          />
        </h1>
        <div className="space-x-2">
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={() => handleUpdateForm(FormStatus.Draft)}
          >
            Save as Draft
          </Button>
          <Button
            className="cursor-pointer"
            onClick={() => handleUpdateForm(FormStatus.Published)}
          >
            Publish
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-12 gap-6">
        {/* Column 1: Question List */}
        <div className="col-span-12 lg:col-span-3">
          <Card className="sticky top-6">
            <CardHeader>
              <h2 className="text-gray-600 text-lg font-medium">Questions</h2>
            </CardHeader>
            <CardContent className="p-4">
              {currentForm.questions.length === 0 ? (
                <div className="text-center text-gray-500 py-4">
                  No questions added yet
                </div>
              ) : (
                <div className="space-y-2">
                  {currentForm.questions.map((question, index) => (
                    <div 
                      key={question.id} 
                      className={`p-3 text-gray-600 rounded-lg cursor-pointer transition-colors border ${
                        selectedQuestion?.id === question.id 
                          ? 'bg-blue-100 border-l-4 border-blue-500' 
                          : draggedIndex === index
                            ? 'bg-blue-50 opacity-50 border-gray-200'
                            : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                      }`}
                      onClick={() => handleSelectQuestion(question)}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center truncate max-w-xs">
                          {/* Drag handle icon */}
                          <div className="text-gray-400 mr-1 cursor-grab flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="9" cy="5" r="1" />
                              <circle cx="9" cy="12" r="1" />
                              <circle cx="9" cy="19" r="1" />
                              <circle cx="15" cy="5" r="1" />
                              <circle cx="15" cy="12" r="1" />
                              <circle cx="15" cy="19" r="1" />
                            </svg>
                          </div>
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-2 text-sm">
                            {index + 1}
                          </div>
                          <div className="truncate">
                            {question.title || `Untitled ${question.type === QuestionType.ShortText ? 'Text' : 'Dropdown'} Question`}
                          </div>
                        </div>
                        <Button
                        //@ts-expect-error
                          onClick={(e) => {
                            e.stopPropagation();
                            removeQuestion(question.id);
                            if (selectedQuestion?.id === question.id) {
                              setSelectedQuestion(null);
                              selectedQuestionIdRef.current = null;
                            }
                          }}
                          variant="ghost"
                          size="sm"
                          className="text-red-500 h-6 w-6 p-0 min-w-0"
                        >
                          ✕
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsTypeSelectorOpen(true)}
                  className="w-full cursor-pointer"
                >
                  + Add Question
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Column 2: Preview */}
        <div className="col-span-12 lg:col-span-5">
          <Card className="sticky top-6">
            <CardHeader>
              <h2 className="text-gray-600 text-lg font-medium">Form Preview</h2>
            </CardHeader>
            <CardContent className="p-4">
              <div className="bg-gray-100 rounded-lg p-4 min-h-[500px]">
                {currentForm.questions.length === 0 ? (
                  <div className="text-center text-gray-500 py-10">
                    Add questions to see a preview
                  </div>
                ) : (
                  <div className="space-y-4">
                    {currentForm.title && (
                      <h3 className="text-gray-600 text-xl font-bold">{currentForm.title}</h3>
                    )}
                    {currentForm.description && (
                      <p className="text-gray-700 mb-4">{currentForm.description}</p>
                    )}
                    
                    {/* Render question previews */}
                    {currentForm.questions.map((question, index) => (
                      <div 
                        key={question.id}
                        className={`p-4 rounded-lg transition-colors cursor-pointer ${
                          selectedQuestion?.id === question.id 
                            ? 'bg-white shadow-md border-l-4 border-blue-500' 
                            : 'bg-white'
                        }`}
                        onClick={() => handleSelectQuestion(question)}
                      >
                        {renderQuestionPreview(question, index)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Column 3: Settings */}
        <div className="col-span-12 lg:col-span-4">
          <Card className="sticky top-6">
            <CardHeader>
              <h2 className="text-gray-600 text-lg font-medium">
                {selectedQuestion 
                  ? `Edit ${selectedQuestion.type === QuestionType.ShortText ? 'Text' : 'Dropdown'} Question` 
                  : 'Question Settings'
                }
              </h2>
            </CardHeader>
            <CardContent className="p-4">
              {renderQuestionSettings()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

