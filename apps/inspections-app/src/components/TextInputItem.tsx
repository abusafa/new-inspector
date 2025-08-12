import React, { useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, X, Image } from 'lucide-react';
import { InspectionItem } from '@/types/inspection';
import { ContextualActions } from './ContextualActions';

interface TextInputItemProps {
  item: InspectionItem;
  value: string | undefined;
  onUpdate: (value: string) => void;
  photos: File[];
  onPhotosUpdate: (photos: File[]) => void;
}

export function TextInputItem({ item, value, onUpdate, photos, onPhotosUpdate }: TextInputItemProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoAdd = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newPhotos = Array.from(files).filter(file => file.type.startsWith('image/'));
      onPhotosUpdate([...photos, ...newPhotos]);
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePhotoRemove = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    onPhotosUpdate(newPhotos);
  };

  return (
    <Card className="shadow-sm border-0 bg-white" data-anchor={value ? "complete-item" : "incomplete-item"}>
      <CardContent className="p-6">
        <div className="space-y-4">
          <Label className="text-lg font-medium leading-relaxed text-foreground">
            {item.label}
            {item.options?.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          
          <Textarea
            value={value || ''}
            onChange={(e) => onUpdate(e.target.value)}
            placeholder="Enter description..."
            className="min-h-[120px] resize-none text-base"
          />

          {item.options?.allow_photos && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2"
                >
                  <Camera className="h-4 w-4" />
                  Add Photos
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoAdd}
                  className="hidden"
                />
              </div>

              {photos.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-border">
                        <div className="text-center">
                          <Image className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                            {photo.name}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handlePhotoRemove(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <ContextualActions />
        </div>
      </CardContent>
    </Card>
  );
}