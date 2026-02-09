"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";

type RsvpOption = {
  id: string;
  order: number;
  label: string;
};

type RsvpQuestion = {
  id: string;
  order: number;
  prompt: string;
  options: RsvpOption[];
};

function makeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function RsvpTab({ weddingId }: { weddingId: Id<"weddings"> }) {
  const config = useQuery(api.rsvp.getConfig, { weddingId });
  const setConfig = useMutation(api.rsvp.setConfig);
  const [questions, setQuestions] = useState<RsvpQuestion[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (config?.questions) {
      setQuestions(config.questions as RsvpQuestion[]);
    } else if (config === null) {
      setQuestions([]);
    }
  }, [config]);

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: makeId(),
        order: prev.length,
        prompt: "",
        options: [
          { id: makeId(), order: 0, label: "" },
          { id: makeId(), order: 1, label: "" },
        ],
      },
    ]);
  };

  const updateQuestion = (index: number, prompt: string) => {
    setQuestions((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], prompt };
      return next;
    });
  };

  const removeQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const addOption = (questionIndex: number) => {
    setQuestions((prev) => {
      const next = [...prev];
      const question = next[questionIndex];
      const options = [
        ...question.options,
        { id: makeId(), order: question.options.length, label: "" },
      ];
      next[questionIndex] = { ...question, options };
      return next;
    });
  };

  const updateOption = (
    questionIndex: number,
    optionIndex: number,
    label: string
  ) => {
    setQuestions((prev) => {
      const next = [...prev];
      const question = next[questionIndex];
      const options = [...question.options];
      options[optionIndex] = { ...options[optionIndex], label };
      next[questionIndex] = { ...question, options };
      return next;
    });
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    setQuestions((prev) => {
      const next = [...prev];
      const question = next[questionIndex];
      const options = question.options.filter((_, i) => i !== optionIndex);
      next[questionIndex] = { ...question, options };
      return next;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const normalized = questions.map((question, qIndex) => ({
        ...question,
        order: qIndex,
        options: question.options.map((option, oIndex) => ({
          ...option,
          order: oIndex,
        })),
      }));

      await setConfig({
        weddingId,
        questions: normalized,
      });
      toast.success("RSVP configuration saved");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save RSVP config"
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>RSVP Configuration</CardTitle>
        <CardDescription>
          Define multiple-choice questions and options (no free-text).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {questions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No questions yet. Add the first question to get started.
          </p>
        ) : (
          <div className="space-y-6">
            {questions.map((question, questionIndex) => (
              <div key={question.id} className="rounded-lg border p-4 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <Label>Question {questionIndex + 1}</Label>
                    <Input
                      value={question.prompt}
                      onChange={(e) =>
                        updateQuestion(questionIndex, e.target.value)
                      }
                      placeholder="e.g., Will you attend the ceremony?"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeQuestion(questionIndex)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Options</Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => addOption(questionIndex)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Option
                    </Button>
                  </div>
                  {question.options.map((option, optionIndex) => (
                    <div
                      key={option.id}
                      className="flex items-center gap-2"
                    >
                      <Input
                        value={option.label}
                        onChange={(e) =>
                          updateOption(
                            questionIndex,
                            optionIndex,
                            e.target.value
                          )
                        }
                        placeholder={`Option ${optionIndex + 1}`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          removeOption(questionIndex, optionIndex)
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={addQuestion}>
            <Plus className="mr-2 h-4 w-4" />
            Add Question
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save RSVP
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
