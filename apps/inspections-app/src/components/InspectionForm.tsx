import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Clock, User, ChevronDown, ChevronRight, CheckCheck } from 'lucide-react';
import { InspectionTemplate, InspectionData, InspectionResult, InspectionItem } from '@/types/inspection';
import { HeaderSection } from './HeaderSection';
import { SectionItem } from './SectionItem';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from '@/hooks/use-toast';

interface InspectionFormProps {
  template: InspectionTemplate;
  onComplete: (result: InspectionResult) => void;
}

export function InspectionForm({ template, onComplete }: InspectionFormProps) {
  const [formData, setFormData] = useState<InspectionData>({});
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<string[]>([]);

  const updateFormData = useCallback((itemId: string, value: string | File[] | boolean) => {
    setFormData(prev => ({
      ...prev,
      [itemId]: value
    }));
    // Clear related errors
    setErrors(prev => prev.filter(error => !error.includes(itemId)));
  }, []);

  const toggleSection = useCallback((sectionId: string) => {
    setCollapsedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  }, []);

  const markSectionAsOK = useCallback((section: InspectionItem) => {
    if (!section.items) return;
    
    const updates: Record<string, string> = {};
    let updatedCount = 0;
    
    const processItems = (items: InspectionItem[]) => {
      items.forEach(item => {
        if (item.type === 'question' && item.response_set) {
          // Find the "Yes" response (typically has score of 1 and green color)
          const yesResponse = item.response_set.responses.find(r => 
            r.score === 1 || r.color === 'green' || r.label.toLowerCase() === 'yes'
          );
          if (yesResponse && !formData[item.item_id]) {
            updates[item.item_id] = yesResponse.id;
            updatedCount++;
          }
        }
        if (item.items) {
          processItems(item.items);
        }
      });
    };
    
    processItems(section.items);
    
    if (updatedCount > 0) {
      setFormData(prev => ({ ...prev, ...updates }));
      toast({
        title: "Section Updated",
        description: `Marked ${updatedCount} items as OK in "${section.label}"`,
      });
    }
  }, [formData]);

  // Calculate progress and validation
  const { progress, totalQuestions, answeredQuestions, validationErrors, sectionProgress } = useMemo(() => {
    const getAllQuestions = (items: InspectionItem[]): InspectionItem[] => {
      return items.reduce((acc, item) => {
        if (item.type === 'question' || item.type === 'text' || item.type === 'signature') {
          // Check if this item should be shown based on conditions
          if (item.conditions) {
            const shouldShow = item.conditions.every(condition => {
              const parentValue = formData[item.parent_id!];
              return parentValue === condition.value;
            });
            if (shouldShow) acc.push(item);
          } else {
            acc.push(item);
          }
        }
        if (item.items) {
          acc.push(...getAllQuestions(item.items));
        }
        return acc;
      }, [] as InspectionItem[]);
    };

    const getSectionProgress = (section: InspectionItem) => {
      if (!section.items) return { completed: 0, total: 0 };
      
      const sectionQuestions = getAllQuestions(section.items);
      const completed = sectionQuestions.filter(q => {
        const value = formData[q.item_id];
        return value !== undefined && value !== '' && value !== null;
      }).length;
      
      return { completed, total: sectionQuestions.length };
    };

    const allHeaderQuestions = template.header_items.filter(item => item.options.required);
    const allContentQuestions = getAllQuestions(template.items);
    const allQuestions = [...allHeaderQuestions, ...allContentQuestions];
    
    const total = allQuestions.length;
    const answered = allQuestions.filter(q => {
      const value = formData[q.item_id];
      return value !== undefined && value !== '' && value !== null;
    }).length;

    const errors: string[] = [];
    
    // Validate required header items
    template.header_items.forEach(item => {
      if (item.options.required && !formData[item.item_id]) {
        errors.push(`${item.label} is required`);
      }
    });

    // Validate all required questions
    template.items.forEach(section => {
      if (section.items) {
        section.items.forEach(item => {
          if (item.options?.required) {
            // Check conditions first
            if (item.conditions) {
              const shouldValidate = item.conditions.every(condition => {
                const parentValue = formData[item.parent_id!];
                return parentValue === condition.value;
              });
              if (shouldValidate && !formData[item.item_id]) {
                errors.push(`${item.label} is required`);
              }
            } else if (!formData[item.item_id]) {
              errors.push(`${item.label} is required`);
            }
          }
        });
      }
    });

    const sectionProgressMap = new Map();
    template.items.forEach(section => {
      sectionProgressMap.set(section.item_id, getSectionProgress(section));
    });
    return {
      progress: total > 0 ? (answered / total) * 100 : 0,
      totalQuestions: total,
      answeredQuestions: answered,
      validationErrors: errors,
      sectionProgress: sectionProgressMap
    };
  }, [formData, template]);

  const calculateScore = () => {
    let totalScore = 0;
    let maxScore = 0;

    const processItems = (items: InspectionItem[]) => {
      items.forEach(item => {
        if (item.type === 'question' && item.response_set) {
          // Check if this item should be scored based on conditions
          let shouldScore = true;
          if (item.conditions) {
            shouldScore = item.conditions.every(condition => {
              const parentValue = formData[item.parent_id!];
              return parentValue === condition.value;
            });
          }

          if (shouldScore) {
            const responseId = formData[item.item_id] as string;
            const selectedResponse = item.response_set.responses.find(r => r.id === responseId);
            
            if (selectedResponse && selectedResponse.score !== null) {
              totalScore += selectedResponse.score;
            }
            
            // Max score is the highest score available for this question
            const maxResponseScore = Math.max(...item.response_set.responses
              .filter(r => r.score !== null)
              .map(r => r.score!));
            maxScore += maxResponseScore;
          }
        }
        if (item.items) {
          processItems(item.items);
        }
      });
    };

    processItems(template.items);
    return { totalScore, maxScore };
  };

  const handleSubmit = () => {
    setErrors(validationErrors);
    
    if (validationErrors.length > 0) {
      return;
    }

    const { totalScore, maxScore } = calculateScore();
    const passThreshold = 0.8; // 80% passing score
    const passed = maxScore > 0 ? (totalScore / maxScore) >= passThreshold : true;

    const result: InspectionResult = {
      template_id: template.template_id,
      completed_at: new Date().toISOString(),
      inspector: formData['item_header_002'] as string || 'Unknown',
      equipment_id: formData['item_header_003'] as string,
      total_score: totalScore,
      max_score: maxScore,
      passed,
      data: formData
    };

    onComplete(result);
  };

  const getCompletionButtonText = () => {
    if (validationErrors.length > 0) {
      return `${validationErrors.length} more items to complete`;
    }
    return 'Complete Inspection';
  };

  const getSectionScore = (section: InspectionItem) => {
    const sectionProg = sectionProgress.get(section.item_id);
    if (!sectionProg) return "0 / 0 (0%)";
    
    const percentage = sectionProg.total > 0 ? Math.round((sectionProg.completed / sectionProg.total) * 100) : 0;
    return `${sectionProg.completed} / ${sectionProg.total} (${percentage}%)`;
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b shadow-sm mb-4">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-foreground leading-tight">{template.name}</h1>
              <p className="text-sm text-muted-foreground">Inspection Form</p>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-blue-600">
                {Math.round(progress)}%
              </div>
              <div className="text-sm text-muted-foreground">
                {answeredQuestions} / {totalQuestions} Complete
              </div>
            </div>
          </div>
          <Progress value={progress} className="mt-2 h-2" />
        </div>
      </div>

      {/* Header Section Card */}
      <Card className="mb-6 shadow-sm border-0 bg-slate-50/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Inspection Details</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <HeaderSection
            items={template.header_items}
            formData={formData}
            onUpdate={updateFormData}
          />
        </CardContent>
      </Card>

      {/* Collapsible Sections */}
      <div className="space-y-4">
        {template.items.map((section) => {
          const isCollapsed = collapsedSections.has(section.item_id);
          const sectionScore = getSectionScore(section);
          
          return (
            <Card key={section.item_id} className="shadow-sm border-0 bg-white">
              <Collapsible open={!isCollapsed} onOpenChange={() => toggleSection(section.item_id)}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors py-4 px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isCollapsed ? (
                          <ChevronRight className="h-5 w-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-slate-400" />
                        )}
                        <CardTitle className="text-lg font-semibold">{section.label}</CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="secondary" 
                          className="text-sm font-medium bg-blue-50 text-blue-700 border-blue-200"
                        >
                          {sectionScore}
                        </Badge>
                        {!isCollapsed && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              markSectionAsOK(section);
                            }}
                            className="flex items-center gap-1 text-green-600 border-green-200 hover:bg-green-50 h-8"
                          >
                            <CheckCheck className="h-4 w-4" />
                            Mark all OK
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0 pb-6 px-6">
                    <SectionItem
                      section={section}
                      formData={formData}
                      onUpdate={updateFormData}
                    />
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <Alert className="mt-6 border-red-200 bg-red-50 shadow-sm">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="font-medium mb-2">Please complete the following:</div>
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={index} className="text-sm">{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Submit Button */}
      <div className="flex justify-center mt-8 mb-8">
        <Button
          onClick={handleSubmit}
          disabled={validationErrors.length > 0}
          className={`h-12 px-8 text-base font-semibold ${
            validationErrors.length > 0 
              ? 'bg-muted text-muted-foreground cursor-not-allowed' 
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          <CheckCircle2 className="h-5 w-5 mr-2" />
          {getCompletionButtonText()}
        </Button>
      </div>

    </div>
  );
}