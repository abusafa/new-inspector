import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, XCircle, FileText, User, Calendar, Hash, Download, ArrowLeft, RotateCcw } from 'lucide-react';
import { InspectionResult } from '@/types/inspection';

interface InspectionResultsProps {
  result: InspectionResult;
  onNewInspection: () => void;
  onBackToTemplates: () => void;
}

export function InspectionResults({ result, onNewInspection, onBackToTemplates }: InspectionResultsProps) {
  const percentageScore = result.max_score > 0 ? Math.round((result.total_score / result.max_score) * 100) : 0;
  
  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPassFailBadge = () => {
    if (result.passed) {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle2 className="h-4 w-4 mr-2" />
          PASSED
        </Badge>
      );
    } else {
      return (
        <Badge variant="destructive">
          <XCircle className="h-4 w-4 mr-2" />
          FAILED
        </Badge>
      );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleExport = () => {
    const exportData = {
      ...result,
      exported_at: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `inspection_${result.template_id}_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <Card className="mb-6">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className={`rounded-full p-4 ${result.passed ? 'bg-green-100' : 'bg-red-100'}`}>
              {result.passed ? (
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              ) : (
                <XCircle className="h-12 w-12 text-red-600" />
              )}
            </div>
          </div>
          <CardTitle className="text-3xl mb-2">Inspection Complete</CardTitle>
          <div className="flex items-center justify-center gap-4">
            {getPassFailBadge()}
            <div className={`text-2xl font-bold ${getScoreColor(percentageScore)}`}>
              {percentageScore}% ({result.total_score}/{result.max_score})
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Inspection Details */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Inspection Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-medium">Inspector</div>
                <div className="text-slate-600">{result.inspector}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-medium">Completed</div>
                <div className="text-slate-600">{formatDate(result.completed_at)}</div>
              </div>
            </div>
            
            {result.equipment_id && (
              <div className="flex items-center gap-3">
                <Hash className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-medium">Equipment ID</div>
                  <div className="text-slate-600">{result.equipment_id}</div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-medium">Template ID</div>
                <div className="text-slate-600 font-mono text-sm">{result.template_id}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Score Breakdown */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Score Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Total Questions Answered</span>
              <span className="font-semibold">{Object.keys(result.data).length}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span>Points Earned</span>
              <span className="font-semibold">{result.total_score}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Points Possible</span>
              <span className="font-semibold">{result.max_score}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center text-lg">
              <span className="font-medium">Final Score</span>
              <span className={`font-bold ${getScoreColor(percentageScore)}`}>
                {percentageScore}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button variant="outline" onClick={onBackToTemplates}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Templates
        </Button>
        
        <Button variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export Results
        </Button>
        
        <Button onClick={onNewInspection}>
          <RotateCcw className="h-4 w-4 mr-2" />
          New Inspection
        </Button>
      </div>
    </div>
  );
}