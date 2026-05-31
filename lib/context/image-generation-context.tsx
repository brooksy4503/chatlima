"use client";

import React, { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction, useEffect } from 'react';
import { useLocalStorage } from '@/lib/hooks/use-local-storage';
import { STORAGE_KEYS } from '@/lib/constants';
import type { ImageGenerationQuality, ImageGenerationOutputFormat } from '@/lib/openrouter-image-generation-tool';

export type ImageGenerationSettings = {
    enabled: boolean;
    quality: ImageGenerationQuality;
    aspectRatio: string;
    outputFormat: ImageGenerationOutputFormat;
    model: string;
};

type ImageGenerationContextType = {
    imageGenerationEnabled: boolean;
    setImageGenerationEnabled: Dispatch<SetStateAction<boolean>>;
    imageGenerationQuality: ImageGenerationQuality;
    setImageGenerationQuality: Dispatch<SetStateAction<ImageGenerationQuality>>;
    imageGenerationAspectRatio: string;
    setImageGenerationAspectRatio: Dispatch<SetStateAction<string>>;
    imageGenerationOutputFormat: ImageGenerationOutputFormat;
    setImageGenerationOutputFormat: Dispatch<SetStateAction<ImageGenerationOutputFormat>>;
    imageGenerationModel: string;
    setImageGenerationModel: Dispatch<SetStateAction<string>>;
};

const DEFAULT_SETTINGS: ImageGenerationSettings = {
    enabled: false,
    quality: 'medium',
    aspectRatio: '1:1',
    outputFormat: 'png',
    model: 'openai/gpt-5-image',
};

const ImageGenerationContext = createContext<ImageGenerationContextType | undefined>(undefined);

interface ImageGenerationProviderProps {
    children: ReactNode;
}

export const ImageGenerationProvider: React.FC<ImageGenerationProviderProps> = ({ children }) => {
    const [settings, setSettings] = useLocalStorage<ImageGenerationSettings>(
        STORAGE_KEYS.IMAGE_GENERATION,
        DEFAULT_SETTINGS
    );

    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const effectiveSettings = isMounted ? settings : DEFAULT_SETTINGS;

    const setImageGenerationEnabled = (enabled: boolean | ((prevState: boolean) => boolean)) => {
        setSettings((prev) => ({
            ...prev,
            enabled: typeof enabled === 'function' ? enabled(prev.enabled) : enabled,
        }));
    };

    const setImageGenerationQuality = (
        quality: ImageGenerationQuality | ((prevState: ImageGenerationQuality) => ImageGenerationQuality)
    ) => {
        setSettings((prev) => ({
            ...prev,
            quality: typeof quality === 'function' ? quality(prev.quality) : quality,
        }));
    };

    const setImageGenerationAspectRatio = (
        aspectRatio: string | ((prevState: string) => string)
    ) => {
        setSettings((prev) => ({
            ...prev,
            aspectRatio: typeof aspectRatio === 'function' ? aspectRatio(prev.aspectRatio) : aspectRatio,
        }));
    };

    const setImageGenerationOutputFormat = (
        outputFormat: ImageGenerationOutputFormat | ((prevState: ImageGenerationOutputFormat) => ImageGenerationOutputFormat)
    ) => {
        setSettings((prev) => ({
            ...prev,
            outputFormat: typeof outputFormat === 'function' ? outputFormat(prev.outputFormat) : outputFormat,
        }));
    };

    const setImageGenerationModel = (model: string | ((prevState: string) => string)) => {
        setSettings((prev) => ({
            ...prev,
            model: typeof model === 'function' ? model(prev.model) : model,
        }));
    };

    return (
        <ImageGenerationContext.Provider
            value={{
                imageGenerationEnabled: effectiveSettings.enabled,
                setImageGenerationEnabled,
                imageGenerationQuality: effectiveSettings.quality,
                setImageGenerationQuality,
                imageGenerationAspectRatio: effectiveSettings.aspectRatio,
                setImageGenerationAspectRatio,
                imageGenerationOutputFormat: effectiveSettings.outputFormat,
                setImageGenerationOutputFormat,
                imageGenerationModel: effectiveSettings.model,
                setImageGenerationModel,
            }}
        >
            {children}
        </ImageGenerationContext.Provider>
    );
};

export const useImageGeneration = (): ImageGenerationContextType => {
    const context = useContext(ImageGenerationContext);
    if (context === undefined) {
        throw new Error('useImageGeneration must be used within an ImageGenerationProvider');
    }
    return context;
};
