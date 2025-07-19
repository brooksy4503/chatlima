"use client";

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { type Preset } from '@/lib/types';
import { type modelID, MODELS } from '@/ai/providers';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

async function fetchPresets(): Promise<Preset[]> {
  const res = await fetch('/api/presets');
  if (!res.ok) throw new Error('Failed to fetch presets');
  return res.json();
}

async function createPreset(newPreset: Omit<Preset, 'id'>): Promise<Preset> {
  const res = await fetch('/api/presets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newPreset),
  });
  if (!res.ok) throw new Error('Failed to create preset');
  return res.json();
}

async function updatePreset(updatedPreset: Preset): Promise<Preset> {
  const res = await fetch(`/api/presets/${updatedPreset.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedPreset),
  });
  if (!res.ok) throw new Error('Failed to update preset');
  return res.json();
}

async function deletePreset(id: string): Promise<void> {
  const res = await fetch(`/api/presets/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete preset');
}

export function PresetManager() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<Preset | null>(null);

  const { data: presets, isLoading } = useQuery({
    queryKey: ['presets'],
    queryFn: fetchPresets
  });

  const createMutation = useMutation({
    mutationFn: createPreset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presets'] });
      setIsOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: updatePreset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presets'] });
      setIsOpen(false);
      setSelectedPreset(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePreset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presets'] });
    },
  });

  const handleShare = (presetId: string) => {
    const url = `${window.location.origin}/chat?preset=${presetId}`;
    navigator.clipboard.writeText(url);
    // Add some user feedback, e.g., a toast notification
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries()) as any;
    data.temperature = parseFloat(data.temperature);
    data.maxTokens = parseInt(data.maxTokens, 10);

    if (selectedPreset) {
      updateMutation.mutate({ ...selectedPreset, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button onClick={() => setSelectedPreset(null)}>Create Preset</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedPreset ? 'Edit' : 'Create'} Preset</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={selectedPreset?.name} required />
            </div>
            <div>
              <Label htmlFor="model">Model</Label>
              <Select name="model" defaultValue={selectedPreset?.model}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {MODELS.map((model) => (
                    <SelectItem key={model} value={model}>{model}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="temperature">Temperature</Label>
              <Input id="temperature" name="temperature" type="number" step="0.1" min="0" max="1" defaultValue={selectedPreset?.temperature ?? 0.7} />
            </div>
            <div>
              <Label htmlFor="maxTokens">Max Tokens</Label>
              <Input id="maxTokens" name="maxTokens" type="number" step="1" min="1" defaultValue={selectedPreset?.maxTokens} />
            </div>
            <div>
              <Label htmlFor="systemPrompt">System Prompt</Label>
              <Textarea id="systemPrompt" name="systemPrompt" defaultValue={selectedPreset?.systemPrompt} />
            </div>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {selectedPreset ? 'Update' : 'Create'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="mt-4 space-y-2">
        {isLoading && <p>Loading presets...</p>}
        {presets?.map((preset) => (
          <div key={preset.id} className="flex items-center justify-between p-2 border rounded">
            <span>{preset.name}</span>
            <div className="space-x-2">
              <Button variant="ghost" size="sm" onClick={() => handleShare(preset.id)}>Share</Button>
              <Button variant="ghost" size="sm" onClick={() => { setSelectedPreset(preset); setIsOpen(true); }}>Edit</Button>
              <Button variant="destructive" size="sm" onClick={() => deleteMutation.mutate(preset.id)}>Delete</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}