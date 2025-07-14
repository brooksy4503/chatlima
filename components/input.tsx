import { ArrowUp, ImageIcon } from "lucide-react";
import { Input as ShadcnInput } from "./ui/input";
import { Button } from "./ui/button";
import { ImageUpload } from "./image-upload";
import { ImagePreview } from "./image-preview";
import type { ImageAttachment } from "@/lib/types";
import { useState } from "react";
import { modelID, modelDetails } from "@/ai/providers";

interface InputProps {
  input: string;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
  status: string;
  stop: () => void;
  // New props for image support
  images?: ImageAttachment[];
  onImagesChange?: (images: ImageAttachment[]) => void;
  maxImages?: number;
  enableImageUpload?: boolean;
  selectedModel: modelID;
}

export const Input = ({
  input,
  handleInputChange,
  isLoading,
  status,
  stop,
  images = [],
  onImagesChange,
  maxImages = 5,
  enableImageUpload = true,
  selectedModel,
}: InputProps) => {
  const [showImageUpload, setShowImageUpload] = useState(false);

  const handleImageSelect = (newImages: ImageAttachment[]) => {
    if (onImagesChange) {
      onImagesChange([...images, ...newImages]);
    }
    setShowImageUpload(false);
  };

  const handleImageRemove = (index: number) => {
    if (onImagesChange) {
      const updatedImages = images.filter((_, i) => i !== index);
      onImagesChange(updatedImages);
    }
  };

  const canUploadMore = images.length < maxImages;
  const hasImages = images.length > 0;
  const canSubmit = (input.trim() || hasImages) && !isLoading;

  return (
    <div className="w-full space-y-3">
      {/* Image Upload Interface */}
      {enableImageUpload && modelDetails[selectedModel]?.vision && showImageUpload && (
        <div className="bg-card border border-border rounded-xl p-4">
          <ImageUpload
            onImageSelect={handleImageSelect}
            maxFiles={maxImages - images.length}
            disabled={isLoading || !canUploadMore}
            showDetailSelector={true}
          />
        </div>
      )}

      {/* Image Preview */}
      {hasImages && (
        <div className="bg-card border border-border rounded-xl p-3">
          <ImagePreview
            images={images}
            onRemove={handleImageRemove}
            maxWidth={120}
            maxHeight={120}
            className="mb-2"
          />
          <div className="text-xs text-muted-foreground">
            {images.length}/{maxImages} images • Click images to remove
          </div>
        </div>
      )}

      {/* Text Input */}
      <div className="relative w-full">
        <ShadcnInput
          className="bg-secondary py-6 w-full rounded-xl pr-20 pl-12"
          value={input}
          autoFocus
          placeholder={hasImages ? "Describe these images or ask questions..." : "Say something..."}
          onChange={handleInputChange}
        />
        
        {/* Image Upload Button */}
        {enableImageUpload && modelDetails[selectedModel]?.vision && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowImageUpload(!showImageUpload)}
            disabled={isLoading || !canUploadMore}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 h-8 w-8"
          >
            <ImageIcon className={`h-4 w-4 ${!canUploadMore ? 'text-muted-foreground' : ''}`} />
          </Button>
        )}

        {/* Submit/Stop Button */}
        {status === "streaming" || status === "submitted" ? (
          <button
            type="button"
            onClick={stop}
            className="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 bg-black hover:bg-zinc-800 disabled:bg-zinc-300 disabled:cursor-not-allowed transition-colors"
          >
            <div className="animate-spin h-4 w-4">
              <svg className="h-4 w-4 text-white" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
          </button>
        ) : (
          <button
            type="submit"
            disabled={!canSubmit}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 bg-black hover:bg-zinc-800 disabled:bg-zinc-300 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowUp className="h-4 w-4 text-white" />
          </button>
        )}
      </div>

      {/* Upload Status Messages */}
    </div>
  );
};
