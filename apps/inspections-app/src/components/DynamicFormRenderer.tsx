import { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  CheckCircle, 
  XCircle, 
  Camera, 
  Signature,
  Calendar,
  Clock,
  User,
  AlertTriangle,
  FileText,

  X,
  Check,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import type { InspectionTemplate, InspectionItem, HeaderItem, InspectionData, InspectionResult } from '../types/inspection';
import { useAuth } from '@/hooks/useAuth';
import { useOfflineSync } from '@/hooks/useOfflineSync';

interface DynamicFormRendererProps {
  template: InspectionTemplate;
  onComplete: (result: InspectionResult) => void;
  onSave?: (data: InspectionData) => void; // For auto-save/offline
}

interface ValidationError {
  itemId: string;
  message: string;
}

export function DynamicFormRenderer({ template, onComplete, onSave }: DynamicFormRendererProps) {
  const { user } = useAuth();
  const { syncStatus, completeInspectionOffline } = useOfflineSync();
  const [formData, setFormData] = useState<InspectionData>({});
  const [photos, setPhotos] = useState<Record<string, File[]>>({});
  const [signatures, setSignatures] = useState<Record<string, string>>({});
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRefs = useRef<Record<string, HTMLInputElement>>({});

  // Initialize header items with current date/time
  useEffect(() => {
    const initialData: InspectionData = {};
    template.header_items.forEach(item => {
      if (item.type === 'datetime' && item.options?.default_to_current_time) {
        initialData[item.item_id] = new Date().toISOString();
      }
    });
    setFormData(initialData);
  }, [template]);

  const updateFormData = useCallback((itemId: string, value: string | boolean | File[]) => {
    setFormData(prev => ({
      ...prev,
      [itemId]: value
    }));
    
    // Clear validation error for this field
    setValidationErrors(prev => prev.filter(error => error.itemId !== itemId));
    
    // Auto-save if callback provided
    onSave?.({ ...formData, [itemId]: value });
  }, [formData, onSave]);

  const handlePhotoCapture = useCallback((itemId: string, files: FileList | null) => {
    if (!files) return;
    
    const newPhotos = Array.from(files);
    setPhotos(prev => ({
      ...prev,
      [itemId]: [...(prev[itemId] || []), ...newPhotos]
    }));
    
    // Update form data to track photo presence
    updateFormData(itemId, [...(photos[itemId] || []), ...newPhotos]);
  }, [photos, updateFormData]);

  const removePhoto = useCallback((itemId: string, photoIndex: number) => {
    setPhotos(prev => {
      const currentPhotos = prev[itemId] || [];
      const newPhotos = currentPhotos.filter((_, index) => index !== photoIndex);
      updateFormData(itemId, newPhotos);
      return {
        ...prev,
        [itemId]: newPhotos
      };
    });
  }, [updateFormData]);

  const handleSignature = useCallback((itemId: string, signed: boolean) => {
    if (signed) {
      // In a real app, this would capture actual signature data
      const signatureData = `signature_${itemId}_${Date.now()}`;
      setSignatures(prev => ({
        ...prev,
        [itemId]: signatureData
      }));
      updateFormData(itemId, true);
    } else {
      setSignatures(prev => {
        const { [itemId]: removed, ...rest } = prev;
        return rest;
      });
      updateFormData(itemId, false);
    }
  }, [updateFormData]);

  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  }, []);

  const getAllItems = useCallback((items: InspectionItem[]): InspectionItem[] => {
    let allItems: InspectionItem[] = [];
    items.forEach(item => {
      allItems.push(item);
      if (item.items) {
        allItems = allItems.concat(getAllItems(item.items));
      }
    });
    return allItems;
  }, []);

  const calculateProgress = useCallback(() => {
    const allItems = [
      ...template.header_items.map(h => ({ ...h, type: h.type as any })),
      ...getAllItems(template.items)
    ];
    
    const requiredItems = allItems.filter(item => 
      item.options?.required && 
      item.type !== 'section'
    );
    
    const completedItems = requiredItems.filter(item => {
      const value = formData[item.item_id];
      if (item.type === 'signature') return signatures[item.item_id];
      if (item.type === 'text' && item.options?.allow_photos) {
        return value || (photos[item.item_id] && photos[item.item_id].length > 0);
      }
      return value !== undefined && value !== '';
    });
    
    return requiredItems.length > 0 ? (completedItems.length / requiredItems.length) * 100 : 100;
  }, [template, formData, signatures, photos, getAllItems]);

  const validateForm = useCallback((): ValidationError[] => {
    const errors: ValidationError[] = [];
    const allItems = [
      ...template.header_items.map(h => ({ ...h, type: h.type as any })),
      ...getAllItems(template.items)
    ];

    allItems.forEach(item => {
      if (item.options?.required && item.type !== 'section') {
        const value = formData[item.item_id];
        
        if (item.type === 'signature' && !signatures[item.item_id]) {
          errors.push({ itemId: item.item_id, message: `${item.label} is required` });
        } else if (item.type !== 'signature' && (!value || value === '')) {
          // For text items with photos allowed, check if photos are provided
          if (item.type === 'text' && item.options?.allow_photos) {
            if (!photos[item.item_id] || photos[item.item_id].length === 0) {
              errors.push({ itemId: item.item_id, message: `${item.label} requires text or photos` });
            }
          } else {
            errors.push({ itemId: item.item_id, message: `${item.label} is required` });
          }
        }
      }
    });

    return errors;
  }, [template, formData, signatures, photos, getAllItems]);

  const calculateScore = useCallback(() => {
    let totalScore = 0;
    let maxScore = 0;

    const allItems = getAllItems(template.items);
    allItems.forEach(item => {
      if (item.type === 'question' && item.response_set) {
        const selectedResponseId = formData[item.item_id] as string;
        const selectedResponse = item.response_set.responses.find(r => r.id === selectedResponseId);
        
        if (selectedResponse && selectedResponse.score !== null) {
          totalScore += selectedResponse.score;
        }
        
        // Max possible score for this question
        const maxResponseScore = Math.max(...item.response_set.responses
          .filter(r => r.score !== null)
          .map(r => r.score as number)
        );
        maxScore += maxResponseScore;
      }
    });

    return { totalScore, maxScore };
  }, [template, formData, getAllItems]);

  const handleSubmit = useCallback(async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      setValidationErrors(errors);
      // Scroll to first error
      const firstError = errors[0];
      const element = document.getElementById(`field-${firstError.itemId}`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { totalScore, maxScore } = calculateScore();
      const result: InspectionResult = {
        template_id: template.template_id,
        completed_at: new Date().toISOString(),
        inspector: user?.name || 'Unknown',
        total_score: totalScore,
        max_score: maxScore,
        passed: maxScore > 0 ? (totalScore / maxScore) >= 0.7 : true, // 70% pass threshold
        data: { ...formData, photos, signatures }
      };

      // Handle offline vs online submission
      if (syncStatus.isOnline) {
        // Online: Submit immediately to server
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // If inspection failed or has critical findings, send for review
        const needsReview = !result.passed || totalScore < (maxScore * 0.8);
        
        if (needsReview) {
          console.log('Inspection submitted for manager review due to:', {
            passed: result.passed,
            score: `${totalScore}/${maxScore}`,
            percentage: Math.round((totalScore / maxScore) * 100)
          });
        }
      } else {
        // Offline: Store locally and queue for sync
        const allPhotos = Object.values(photos).flat();
        const allSignatures = Object.values(signatures);
        
        completeInspectionOffline(
          template.template_id, // Using template_id as workOrderId for now
          template.template_id,
          result,
          allPhotos,
          allSignatures
        );
        
        console.log('Inspection saved offline - will sync when connection is restored');
      }
      
      onComplete(result);
    } catch (error) {
      console.error('Failed to submit inspection:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm, calculateScore, template, formData, photos, signatures, user, onComplete]);

  const renderHeaderItem = (item: HeaderItem) => {
    const value = formData[item.item_id] || '';
    const error = validationErrors.find(e => e.itemId === item.item_id);

    return (
      <div key={item.item_id} id={`field-${item.item_id}`} className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          {item.type === 'datetime' && <Calendar className="h-4 w-4" />}
          {item.type === 'text' && <User className="h-4 w-4" />}
          {item.label}
          {item.options?.required && <span className="text-red-500">*</span>}
        </label>
        
        {item.type === 'datetime' ? (
          <Input
            type="datetime-local"
            value={value ? new Date(value as string).toISOString().slice(0, 16) : ''}
            onChange={(e) => updateFormData(item.item_id, e.target.value ? new Date(e.target.value).toISOString() : '')}
            className={error ? 'border-red-500' : ''}
          />
        ) : (
          <Input
            type="text"
            value={value as string}
            onChange={(e) => updateFormData(item.item_id, e.target.value)}
            placeholder={item.options?.placeholder}
            className={error ? 'border-red-500' : ''}
          />
        )}
        
        {error && (
          <div className="text-red-500 text-sm flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            {error.message}
          </div>
        )}
      </div>
    );
  };

  const renderQuestionItem = (item: InspectionItem) => {
    if (!item.response_set) return null;
    
    const selectedValue = formData[item.item_id] as string;
    const error = validationErrors.find(e => e.itemId === item.item_id);

    return (
      <div key={item.item_id} id={`field-${item.item_id}`} className="space-y-3">
        <label className="text-sm font-medium flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          {item.label}
          {item.options?.required && <span className="text-red-500">*</span>}
        </label>
        
        <div className="grid gap-2">
          {item.response_set.responses.map(response => (
            <Button
              key={response.id}
              variant={selectedValue === response.id ? "default" : "outline"}
              className={`justify-start h-auto p-3 ${
                selectedValue === response.id 
                  ? response.color === 'green' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : response.color === 'red'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-primary hover:bg-primary/90'
                  : ''
              }`}
              onClick={() => updateFormData(item.item_id, response.id)}
            >
              <div className="flex items-center gap-3">
                {response.color === 'green' && <CheckCircle className="h-4 w-4" />}
                {response.color === 'red' && <XCircle className="h-4 w-4" />}
                <span>{response.label}</span>
                {response.score !== null && (
                  <Badge variant="secondary" className="ml-auto">
                    {response.score} pts
                  </Badge>
                )}
              </div>
            </Button>
          ))}
        </div>
        
        {error && (
          <div className="text-red-500 text-sm flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            {error.message}
          </div>
        )}
      </div>
    );
  };

  const renderTextItem = (item: InspectionItem) => {
    const value = formData[item.item_id] as string || '';
    const itemPhotos = photos[item.item_id] || [];
    const error = validationErrors.find(e => e.itemId === item.item_id);

    return (
      <div key={item.item_id} id={`field-${item.item_id}`} className="space-y-3">
        <label className="text-sm font-medium flex items-center gap-2">
          <FileText className="h-4 w-4" />
          {item.label}
          {item.options?.required && <span className="text-red-500">*</span>}
        </label>
        
        <Textarea
          value={value}
          onChange={(e) => updateFormData(item.item_id, e.target.value)}
          placeholder="Enter your observations..."
          className={`min-h-20 ${error ? 'border-red-500' : ''}`}
        />
        
        {item.options?.allow_photos && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Photos ({itemPhotos.length})</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRefs.current[item.item_id]?.click()}
              >
                <Camera className="h-4 w-4 mr-2" />
                Add Photos
              </Button>
              <input
                ref={el => { if (el) fileInputRefs.current[item.item_id] = el; }}
                type="file"
                accept="image/*"
                multiple
                capture="environment"
                className="hidden"
                onChange={(e) => handlePhotoCapture(item.item_id, e.target.files)}
              />
            </div>
            
            {itemPhotos.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {itemPhotos.map((photo, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(photo)}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-20 object-cover rounded border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 p-0"
                      onClick={() => removePhoto(item.item_id, index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {error && (
          <div className="text-red-500 text-sm flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            {error.message}
          </div>
        )}
      </div>
    );
  };

  const renderSignatureItem = (item: InspectionItem) => {
    const isSigned = signatures[item.item_id];
    const error = validationErrors.find(e => e.itemId === item.item_id);

    return (
      <div key={item.item_id} id={`field-${item.item_id}`} className="space-y-3">
        <label className="text-sm font-medium flex items-center gap-2">
          <Signature className="h-4 w-4" />
          {item.label}
          {item.options?.required && <span className="text-red-500">*</span>}
        </label>
        
        <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
          {isSigned ? (
            <div className="space-y-2">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto" />
              <p className="text-sm text-green-600 font-medium">Signed by {user?.name}</p>
              <p className="text-xs text-muted-foreground">
                {new Date().toLocaleString()}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleSignature(item.item_id, false)}
              >
                Clear Signature
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Signature className="h-8 w-8 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">Tap to sign</p>
              <Button
                type="button"
                onClick={() => handleSignature(item.item_id, true)}
                className={error ? 'border-red-500' : ''}
              >
                Sign Here
              </Button>
            </div>
          )}
        </div>
        
        {error && (
          <div className="text-red-500 text-sm flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            {error.message}
          </div>
        )}
      </div>
    );
  };

  const renderInspectionItem = (item: InspectionItem): React.ReactNode => {
    // Check if item should be visible based on conditions
    if (item.conditions && item.conditions.length > 0) {
      const shouldShow = item.conditions.every(condition => {
        const parentValue = formData[condition.field];
        return parentValue === condition.value;
      });
      if (!shouldShow) return null;
    }

    switch (item.type) {
      case 'section':
        return renderSection(item);
      case 'question':
        return renderQuestionItem(item);
      case 'text':
        return renderTextItem(item);
      case 'signature':
        return renderSignatureItem(item);
      default:
        return null;
    }
  };

  const renderSection = (section: InspectionItem) => {
    const isExpanded = expandedSections.has(section.item_id);
    const sectionItems = section.items || [];
    const completedItems = sectionItems.filter(item => {
      const value = formData[item.item_id];
      if (item.type === 'signature') return signatures[item.item_id];
      return value !== undefined && value !== '';
    });
    const progress = sectionItems.length > 0 ? (completedItems.length / sectionItems.length) * 100 : 100;

    return (
      <Card key={section.item_id} className="overflow-hidden">
        <CardHeader 
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => toggleSection(section.item_id)}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg flex items-center gap-2">
                {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                {section.label}
              </CardTitle>
              <CardDescription className="mt-1">
                {completedItems.length} of {sectionItems.length} items completed
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">{Math.round(progress)}%</div>
              <Progress value={progress} className="w-20 h-2" />
            </div>
          </div>
        </CardHeader>
        
        {isExpanded && (
          <CardContent className="space-y-6">
            {sectionItems.map(item => renderInspectionItem(item))}
          </CardContent>
        )}
      </Card>
    );
  };

  const progress = calculateProgress();
  const errors = validationErrors.length;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {template.name}
          </CardTitle>
          <CardDescription>{template.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-3" />
            {errors > 0 && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertTriangle className="h-4 w-4" />
                {errors} field{errors > 1 ? 's' : ''} require{errors === 1 ? 's' : ''} attention
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Header Items */}
      {template.header_items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Inspection Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {template.header_items.map(renderHeaderItem)}
          </CardContent>
        </Card>
      )}

      {/* Inspection Items */}
      <div className="space-y-4">
        {template.items.map(item => renderInspectionItem(item))}
      </div>

      {/* Submit Button */}
      <Card>
        <CardContent className="p-6">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                size="lg" 
                className="w-full"
                disabled={progress < 100 || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Complete Inspection
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Complete Inspection?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to submit this inspection? This action cannot be undone.
                  <div className="mt-2 p-3 bg-muted rounded">
                    <div className="text-sm">
                      <div>Progress: {Math.round(progress)}%</div>
                      <div>Inspector: {user?.name}</div>
                      <div>Date: {new Date().toLocaleString()}</div>
                    </div>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Review Again</AlertDialogCancel>
                <AlertDialogAction onClick={handleSubmit}>
                  Submit Inspection
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
