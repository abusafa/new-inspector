import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock, User, Hash } from 'lucide-react';
import { HeaderItem, InspectionData } from '@/types/inspection';

interface HeaderSectionProps {
  items: HeaderItem[];
  formData: InspectionData;
  onUpdate: (itemId: string, value: string) => void;
}

export function HeaderSection({ items, formData, onUpdate }: HeaderSectionProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'datetime':
        return Clock;
      case 'text':
        return items.find(item => item.label.toLowerCase().includes('name')) ? User : Hash;
      default:
        return Hash;
    }
  };

  const handleInputChange = (itemId: string, value: string) => {
    onUpdate(itemId, value);
  };

  // Set default datetime if needed
  React.useEffect(() => {
    items.forEach(item => {
      if (item.type === 'datetime' && item.options.default_to_current_time && !formData[item.item_id]) {
        const now = new Date();
        const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
        onUpdate(item.item_id, localDateTime);
      }
    });
  }, [items, formData, onUpdate]);

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const Icon = getIcon(item.type);
        const isRequired = item.options.required;
        const value = formData[item.item_id] as string || '';
        
        return (
          <div key={item.item_id} className="space-y-3">
            <Label className="flex items-center gap-2 text-base font-medium text-foreground">
              <Icon className="h-4 w-4 text-blue-600" />
              {item.label}
              {isRequired && <span className="text-red-500">*</span>}
            </Label>
            <Input
              type={item.type === 'datetime' ? 'datetime-local' : 'text'}
              value={value}
              onChange={(e) => handleInputChange(item.item_id, e.target.value)}
              className={`h-12 text-base transition-colors ${
                isRequired && !value ? 'border-destructive focus:border-destructive' : ''
              }`}
              placeholder={
                item.type === 'text' 
                  ? `Enter ${item.label.toLowerCase()}...` 
                  : undefined
              }
            />
          </div>
        );
      })}
    </div>
  )
}