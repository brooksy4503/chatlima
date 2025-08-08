"use client";

import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useModel } from '@/lib/context/model-context';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface FavoriteToggleProps {
  modelId: string;
  isFavorite: boolean;
  onToggle?: (modelId: string, isFavorite: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function FavoriteToggle({
  modelId,
  isFavorite,
  onToggle,
  disabled = false,
  size = 'md',
  className,
}: FavoriteToggleProps) {
  const { toggleFavorite } = useModel();
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (disabled || isToggling) return;

    setIsToggling(true);

    try {
      const success = await toggleFavorite?.(modelId);
      if (success && onToggle) {
        onToggle(modelId, !isFavorite);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsToggling(false);
    }
  };

  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const buttonSizeClasses = {
    sm: 'p-0.5',
    md: 'p-1',
    lg: 'p-1.5',
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled || isToggling}
          className={cn(
            'inline-flex items-center justify-center rounded-sm transition-all duration-200',
            'hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-1',
            'active:scale-95',
            buttonSizeClasses[size],
            (disabled || isToggling) && 'opacity-50 cursor-not-allowed hover:bg-transparent',
            className
          )}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Star
            className={cn(
              sizeClasses[size],
              'transition-all duration-200',
              isFavorite
                ? 'fill-yellow-400 text-yellow-500 drop-shadow-sm'
                : 'text-muted-foreground hover:text-yellow-500',
              isToggling && 'animate-pulse'
            )}
          />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <p className="text-xs">
          {isToggling
            ? (isFavorite ? 'Removing from favorites...' : 'Adding to favorites...')
            : (isFavorite ? 'Remove from favorites' : 'Add to favorites')
          }
        </p>
      </TooltipContent>
    </Tooltip>
  );
} 