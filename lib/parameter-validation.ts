// Parameter validation utilities for presets
import { ModelInfo, modelDetails, type modelID } from "@/ai/providers";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface ParameterConstraints {
  temperature: { min: number; max: number; default: number };
  maxTokens: { min: number; max: number; default: number };
  supportsSystemInstruction: boolean;
  maxSystemInstructionLength: number;
}

// Default constraints for models that don't have specific constraints defined
const DEFAULT_CONSTRAINTS: ParameterConstraints = {
  temperature: { min: 0, max: 2, default: 1 },
  maxTokens: { min: 1, max: 4096, default: 1024 },
  supportsSystemInstruction: true,
  maxSystemInstructionLength: 4000
};

/**
 * Get parameter constraints for a specific model
 */
export function getModelParameterConstraints(modelId: modelID): ParameterConstraints {
  const modelInfo = modelDetails[modelId];
  
  if (!modelInfo) {
    console.warn(`Model ${modelId} not found in modelDetails, using default constraints`);
    return DEFAULT_CONSTRAINTS;
  }

  return {
    temperature: modelInfo.temperatureRange || DEFAULT_CONSTRAINTS.temperature,
    maxTokens: modelInfo.maxTokensRange || DEFAULT_CONSTRAINTS.maxTokens,
    supportsSystemInstruction: modelInfo.supportsSystemInstruction !== false,
    maxSystemInstructionLength: modelInfo.maxSystemInstructionLength || DEFAULT_CONSTRAINTS.maxSystemInstructionLength
  };
}

/**
 * Validate preset parameters for a specific model
 */
export function validatePresetParameters(
  modelId: modelID, 
  temperature?: number, 
  maxTokens?: number, 
  systemInstruction?: string
): ValidationResult {
  const constraints = getModelParameterConstraints(modelId);
  const errors: string[] = [];

  // Validate temperature
  if (temperature !== undefined) {
    if (typeof temperature !== 'number' || isNaN(temperature)) {
      errors.push('Temperature must be a valid number');
    } else if (temperature < constraints.temperature.min || temperature > constraints.temperature.max) {
      errors.push(`Temperature must be between ${constraints.temperature.min} and ${constraints.temperature.max}`);
    }
  }

  // Validate max tokens
  if (maxTokens !== undefined) {
    if (!Number.isInteger(maxTokens) || maxTokens < 1) {
      errors.push('Max tokens must be a positive integer');
    } else if (maxTokens < constraints.maxTokens.min || maxTokens > constraints.maxTokens.max) {
      errors.push(`Max tokens must be between ${constraints.maxTokens.min} and ${constraints.maxTokens.max}`);
    }
  }

  // Validate system instruction
  if (systemInstruction !== undefined) {
    const instructionValidation = validateSystemInstruction(systemInstruction, modelId);
    if (!instructionValidation.valid) {
      errors.push(...instructionValidation.errors);
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate system instruction content and security
 */
export function validateSystemInstruction(instruction: string, modelId: modelID): ValidationResult {
  const errors: string[] = [];
  const constraints = getModelParameterConstraints(modelId);
  
  // Length validation
  if (instruction.length > constraints.maxSystemInstructionLength) {
    errors.push(`System instruction too long (max ${constraints.maxSystemInstructionLength} characters)`);
  }
  
  if (instruction.length < 10) {
    errors.push('System instruction must be at least 10 characters');
  }
  
  // Content validation - check for prompt injection risks
  if (containsPromptInjectionRisk(instruction)) {
    errors.push('System instruction contains potentially unsafe content');
  }
  
  // Character validation (prevent control characters)
  if (/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(instruction)) {
    errors.push('System instruction contains invalid characters');
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Check for basic prompt injection patterns
 */
export function containsPromptInjectionRisk(text: string): boolean {
  // Basic prompt injection patterns
  const riskyPatterns = [
    /ignore\s+(?:previous|above|earlier)\s+instructions?/i,
    /forget\s+(?:everything|all)\s+(?:previous|above|earlier)/i,
    /new\s+instructions?:/i,
    /system\s*:\s*you\s+are\s+now/i,
    /override\s+(?:previous|above|earlier)\s+instructions?/i,
    /\[INST\]|\[\/INST\]/i, // Common instruction markers
    /<\s*system\s*>/i, // System tags
    /assistant\s*:\s*i\s+(?:am|will)\s+now/i, // Assistant hijacking
  ];
  
  return riskyPatterns.some(pattern => pattern.test(text));
}

/**
 * Validate model access for user (premium models, etc.)
 */
export function validateModelAccess(modelId: modelID, userCanAccessPremium: boolean): ValidationResult {
  const modelInfo = modelDetails[modelId];
  
  if (!modelInfo || !modelInfo.enabled) {
    return { valid: false, errors: ['Model not available'] };
  }
  
  if (modelInfo.premium && !userCanAccessPremium) {
    return { valid: false, errors: ['Premium model requires credits or subscription'] };
  }
  
  return { valid: true, errors: [] };
}

/**
 * Get default parameter values for a model
 */
export function getModelDefaults(modelId: modelID): {
  temperature: number;
  maxTokens: number;
  systemInstruction: string;
} {
  const constraints = getModelParameterConstraints(modelId);
  
  return {
    temperature: constraints.temperature.default,
    maxTokens: constraints.maxTokens.default,
    systemInstruction: `You are a helpful AI assistant. Today's date is ${new Date().toISOString().split('T')[0]}.`
  };
}

/**
 * Sanitize system instruction to remove potential security risks
 */
export function sanitizeSystemInstruction(instruction: string): string {
  // Remove potential control characters
  let sanitized = instruction.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // Trim excessive whitespace
  sanitized = sanitized.trim().replace(/\s+/g, ' ');
  
  return sanitized;
}