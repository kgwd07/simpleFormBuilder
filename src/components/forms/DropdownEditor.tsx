import React, { useState } from "react";
import { DropdownQuestion } from "@/models/forms";
import { useFormBuilderStore } from "@/store/formBuilderStore";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Switch } from "@/components/ui/Switch";
import { Button } from "@/components/ui/Button";
import { Modal } from "../ui/Modal";

interface DropdownEditorProps {
  question: DropdownQuestion;
}

export const DropdownEditor: React.FC<DropdownEditorProps> = ({ question }) => {
  const updateQuestion = useFormBuilderStore((state) => state.updateQuestion);
  const addOption = useFormBuilderStore((state) => state.addOption);
  const updateOption = useFormBuilderStore((state) => state.updateOption);
  const removeOption = useFormBuilderStore((state) => state.removeOption);
  const [multiOptionMode, setMultiOptionMode] = useState(false);
  const [multiOptionList, setMultiOptionList] = useState('');
  const [selectedQuestionId, setSelectedQuestionId] = useState('');

  const handleChange = (field: string, value: any) => {
    updateQuestion(question.id, { [field]: value });
  };

  const addManyOptions = (questionId: string) => {
    setMultiOptionList('')
    setSelectedQuestionId(questionId)
    setMultiOptionMode(true)
  }

  const showOptions = () => {

    const newAddedOptions = multiOptionList.split('\n');

    newAddedOptions.forEach((option:string) => {
      addOption(selectedQuestionId, option)
    } )

    setMultiOptionMode(false)
    
  }
  

  return (
    <div className="space-y-4">
      <Modal 
              isOpen={multiOptionMode} 
              onClose={() => setMultiOptionMode(false)}
              title="Add Options"
            >
              <Textarea
                id="form-description"
                label="add List of options"
                value={multiOptionList || ''}
                onChange={(e) => setMultiOptionList(e.target.value)}
                placeholder="Add options leaving a line"
                rows={10} 
              />
              <div className="mt-4 text-center">
                <Button
                  variant="outline"
                  className="cursor-pointer"
                  isDisabled={!multiOptionList.trim()}
                  onClick={() => showOptions()}
                >
                  Done
                </Button>
              </div>
            </Modal>
        
      <Input
        id={`question-${question.id}-title`}
        label="Question"
        value={question.title}
        onChange={(e) => handleChange("title", e.target.value)}
        placeholder="Enter your question here"
      />

      {/* <Textarea
        id={`question-${question.id}-description`}
        label="Description (optional)"
        value={question.description || ''}
        onChange={(e) => handleChange('description', e.target.value)}
        placeholder="Add a description to provide more context"
      /> */}

      <Input
        id={`question-${question.id}-description`}
        label="Description (optional)"
        value={question.description || ""}
        onChange={(e) => handleChange("description", e.target.value)}
        placeholder="Add a description to provide more context"
      />

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Options
        </label>
        {question.options.map((option, index) => (
          <div key={option.id} className="flex items-center space-x-2">
            <Input
              id={`option-${option.id}`}
              value={option.value}
              onChange={(e) =>
                updateOption(question.id, option.id, e.target.value)
              }
              className="mb-0 flex-1"
            />
            {question.options.length > 1 && <Button
              onClick={() => removeOption(question.id, option.id)}
              variant="ghost"
              size="sm"
              className="text-red-500"
              isDisabled={question.options.length <= 1}
            >
              ✕
            </Button>}
          </div>
        ))}

        {/* <Button
          onClick={() =>
            addOption(question.id, `Option ${question.options.length + 1}`)
          }
          variant="outline"
          size="sm"
          className="mt-2 cursor-pointer"
        >
          + Add Option
        </Button> */}

        <Button
          onClick={() =>
            addManyOptions(question.id)
          }
          variant="outline"
          size="sm"
          className="mt-2 ml-2 cursor-pointer"
        >
          + Add Options
        </Button>
      </div>

      <div className="pt-2 space-y-2">
        <Switch
          id={`question-${question.id}-required`}
          label="Required question"
          isChecked={question.isRequired}
          onChange={(value) => handleChange("isRequired", value)}
        />

        {/* <Switch
          id={`question-${question.id}-custom-input`}
          label="Allow custom input"
          isChecked={question.allowCustomInput}
          onChange={(value) => handleChange("allowCustomInput", value)}
        /> */}
      </div>
    </div>
  );
};
