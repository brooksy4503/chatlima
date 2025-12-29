"use client";

import { ModelInfo } from '@/lib/types/models';
import { CopyButton } from '@/components/copy-button';

interface ModelPromptsProps {
  model: ModelInfo;
}

const SAMPLE_PROMPTS: Record<string, string[]> = {
  coding: [
    'Write a function to sort an array of objects by a specific property in JavaScript',
    'Explain how to implement a binary search tree and discuss its time complexity',
    'Debug this code and explain the issues: [paste your code here]'
  ],
  reasoning: [
    'Think step-by-step through a complex problem and break it down into smaller parts',
    'Analyze this scenario from multiple perspectives and identify the best approach',
    'Explain your reasoning process for solving this problem'
  ],
  general: [
    'Explain quantum computing in simple terms like I\'m 10 years old',
    'Write a compelling email asking for a meeting to discuss a project proposal',
    'Help me brainstorm creative solutions for improving team productivity'
  ],
  vision: [
    'Analyze this image and describe what you see in detail',
    'Extract the key information from this screenshot',
    'Compare the two images and explain the differences'
  ]
};

export function ModelPrompts({ model }: ModelPromptsProps) {
  const capabilities = model.capabilities.map(c => c.toLowerCase());

  let promptCategory: string = 'general';
  if (capabilities.includes('coding')) {
    promptCategory = 'coding';
  } else if (capabilities.includes('reasoning')) {
    promptCategory = 'reasoning';
  } else if (model.vision) {
    promptCategory = 'vision';
  }

  const prompts = SAMPLE_PROMPTS[promptCategory] || SAMPLE_PROMPTS.general;

  return (
    <div className="bg-card rounded-xl p-6 border border-border/50">
      <h2 className="text-2xl font-semibold text-foreground mb-4">
        Sample Prompts
      </h2>
      <p className="text-muted-foreground text-sm mb-4">
        Try these prompts to explore {model.name}&apos;s capabilities:
      </p>
      <div className="space-y-3">
        {prompts.map((prompt, index) => (
          <div
            key={index}
            className="bg-muted/50 rounded-lg p-4 border border-border/40 relative group hover:bg-muted/80 transition-colors"
          >
            <p className="text-foreground/90 pr-10 text-sm leading-relaxed">
              {prompt}
            </p>
            <CopyButton
              text={prompt}
              className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </div>
        ))}
      </div>
      <p className="text-muted-foreground text-xs mt-4">
        Tip: Customize these prompts to fit your specific needs and use cases.
      </p>
    </div>
  );
}
