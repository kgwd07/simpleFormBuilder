import React from 'react';
import { Question, QuestionType } from '@/models/forms';
import { useFormBuilderStore } from '@/store/formBuilderStore';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TextFieldEditor } from './TextFieldEditor';
import { DropdownEditor } from './DropdownEditor';

interface QuestionCardProps {
  question: Question;
  index: number;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ question, index }) => {
  const removeQuestion = useFormBuilderStore((state) => state.removeQuestion);
  
  const renderQuestionEditor = () => {
    switch (question.type) {
      case QuestionType.ShortText:
        return <TextFieldEditor question={question} />;
      case QuestionType.Dropdown:
        return <DropdownEditor question={question} />;
      default:
        return <div>Unsupported question type</div>;
    }
  };
  
  return (
    <Card className="mb-4">
      <CardHeader className="flex justify-between items-center">
      <div className="flex items-center">
  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-2">
    {index + 1}
  </div>
  <h3 className="text-lg font-medium text-gray-900">
    {question.type === QuestionType.ShortText ? 'Text Field' : 'Dropdown'}
  </h3>
</div>
        <Button
          onClick={() => removeQuestion(question.id)}
          variant="ghost"
          size="sm"
          className="text-red-500"
        >
          Delete
        </Button>
      </CardHeader>
      <CardContent>
        {renderQuestionEditor()}
      </CardContent>
    </Card>
  );
};