import React from 'react';
import { InspectionItem, InspectionData } from '@/types/inspection';
import { QuestionItem } from './QuestionItem';
import { TextInputItem } from './TextInputItem';
import { SignatureItem } from './SignatureItem';

interface SectionItemProps {
  section: InspectionItem;
  formData: InspectionData;
  onUpdate: (itemId: string, value: string | File[] | boolean) => void;
}

export function SectionItem({ section, formData, onUpdate }: SectionItemProps) {
  if (!section.items) return null;

  const visibleItems = section.items.filter(item => {
    if (!item.conditions) return true;
    
    return item.conditions.every(condition => {
      const parentValue = formData[item.parent_id!];
      return parentValue === condition.value;
    });
  });


  return (
    <div className="space-y-6">
      {visibleItems.map((item) => {
        switch (item.type) {
          case 'question':
            return (
              <QuestionItem
                key={item.item_id}
                item={item}
                value={formData[item.item_id] as string}
                onUpdate={(value) => onUpdate(item.item_id, value)}
                formData={formData}
              />
            );
          case 'text':
            return (
              <TextInputItem
                key={item.item_id}
                item={item}
                value={formData[item.item_id] as string}
                onUpdate={(value) => onUpdate(item.item_id, value)}
                photos={formData[`${item.item_id}_photos`] as File[] || []}
                onPhotosUpdate={(photos) => onUpdate(`${item.item_id}_photos`, photos)}
              />
            );
          case 'signature':
            return (
              <SignatureItem
                key={item.item_id}
                item={item}
                value={formData[item.item_id] as boolean}
                onUpdate={(value) => onUpdate(item.item_id, value)}
              />
            );
          default:
            return null;
        }
      })}
    </div>
  );
}