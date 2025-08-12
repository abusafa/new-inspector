import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, XCircle, MinusCircle, Camera, Plus, AlertTriangle } from 'lucide-react';
import { InspectionItem, InspectionData } from '@/types/inspection';
import { ContextualActions } from './ContextualActions';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';

interface QuestionItemProps {
  item: InspectionItem;
  value: string | undefined;
  onUpdate: (value: string) => void;
  formData: InspectionData;
}

export function QuestionItem({ item, value, onUpdate }: QuestionItemProps) {
  const [showProblemDetails, setShowProblemDetails] = useState(false);
  
  if (!item.response_set) return null;

  const selectedResponse = item.response_set.responses.find(r => r.id === value);
  const isFailure = selectedResponse && (selectedResponse.score === 0 || selectedResponse.color === 'red');
  const isComplete = !!value;

  const getIcon = (color: string) => {
    switch (color) {
      case 'green':
        return CheckCircle;
      case 'red':
        return XCircle;
      case 'grey':
        return MinusCircle;
      default:
        return MinusCircle;
    }
  };

  const handleResponseSelect = (responseId: string) => {
    onUpdate(responseId);
    const response = item.response_set!.responses.find(r => r.id === responseId);
    const isFailureResponse = response && (response.score === 0 || response.color === 'red');
    setShowProblemDetails(isFailureResponse || false);
  };

  return (
    <Card className="shadow-sm border-0 bg-white" data-anchor={isComplete ? "complete-item" : "incomplete-item"}>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            {isFailure && (
              <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-1" />
            )}
            <Label className="text-lg font-medium leading-relaxed text-foreground flex-1">
              {item.label}
              {item.options?.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
          </div>
          
          {/* Segmented Control for Responses */}
          <div className="flex rounded-xl border-2 border-slate-200 overflow-hidden shadow-sm">
            {item.response_set.responses.map((response, index) => {
              const Icon = getIcon(response.color);
              const isSelected = value === response.id;
              
              let bgColor = 'bg-white hover:bg-slate-50';
              let textColor = 'text-foreground';
              
              if (isSelected) {
                switch (response.color) {
                  case 'green':
                    bgColor = 'bg-green-600';
                    textColor = 'text-white';
                    break;
                  case 'red':
                    bgColor = 'bg-red-600';
                    textColor = 'text-white';
                    break;
                  case 'grey':
                    bgColor = 'bg-slate-600';
                    textColor = 'text-white';
                    break;
                }
              }
              
              return (
                <Button
                  key={response.id}
                  variant="ghost"
                  className={`flex-1 h-14 rounded-none ${bgColor} ${textColor} ${
                    index > 0 ? 'border-l-2 border-slate-200' : ''
                  } transition-all duration-200`}
                  onClick={() => handleResponseSelect(response.id)}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    <span className="font-semibold text-base">{response.label}</span>
                  </div>
                </Button>
              );
            })}
          </div>
    
          {/* Problem Details Section */}
          <Collapsible open={showProblemDetails} onOpenChange={setShowProblemDetails}>
            <CollapsibleContent>
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg space-y-4">
                <div className="flex items-center gap-2 text-red-800 font-medium">
                  <AlertTriangle className="h-4 w-4" />
                  Issue Identified - Please provide details
                </div>
                
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-red-800">
                      Describe the issue *
                    </Label>
                    <Textarea
                      placeholder="Provide details about what was observed..."
                      className="mt-1 border-red-200 focus:border-red-400"
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex items-center gap-2 border-red-200 text-red-700 hover:bg-red-50">
                      <Camera className="h-4 w-4" />
                      Add Photo
                    </Button>
                    <Button size="sm" variant="outline" className="flex items-center gap-2 border-red-200 text-red-700 hover:bg-red-50">
                      <Plus className="h-4 w-4" />
                      Create Work Order
                    </Button>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>


          {/* Standard Contextual Actions (only show if not a failure) */}
          {!isFailure && <ContextualActions />}
        </div>
      </CardContent>
    </Card>
  );
}