import React from "react";
import { TextQuestion } from "@/models/forms";
import { useFormBuilderStore } from "@/store/formBuilderStore";
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";

interface TextFieldEditorProps {
  question: TextQuestion;
}

export const TextFieldEditor: React.FC<TextFieldEditorProps> = ({
  question,
}) => {
  const updateQuestion = useFormBuilderStore((state) => state.updateQuestion);

  const handleChange = (field: string, value: any) => {
    updateQuestion(question.id, { [field]: value });
  };

  return (
    <div className="space-y-4">
      <Input
        id={`question-${question.id}-title`}
        label="Question"
        value={question.title}
        onChange={(e) => handleChange("title", e.target.value)}
        placeholder="Enter your question here"
      />

      <Input
        id={`question-${question.id}-description`}
        label="Description (optional)"
        value={question.description || ""}
        onChange={(e) => handleChange("description", e.target.value)}
        placeholder="Add a description to provide more context"
      />

      <Input
        id={`question-${question.id}-placeholder`}
        label="Placeholder text"
        value={question.placeholder || ""}
        onChange={(e) => handleChange("placeholder", e.target.value)}
        placeholder="Enter placeholder text"
      />

      <div className="pt-2">
        <Switch
          id={`question-${question.id}-required`}
          label="Required question"
          isChecked={question.isRequired}
          onChange={(value) => handleChange("isRequired", value)}
        />
      </div>
    </div>
  );
};
