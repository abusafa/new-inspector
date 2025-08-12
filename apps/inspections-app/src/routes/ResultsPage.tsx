import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { InspectionResults } from '@/components/InspectionResults';
import { InspectionResult } from '@/types/inspection';

export function ResultsPage() {
  const navigate = useNavigate();
  const { inspectionId } = useParams();

  const result: InspectionResult | null = useMemo(() => {
    try {
      const raw = sessionStorage.getItem(`inspection_result_${inspectionId}`);
      return raw ? (JSON.parse(raw) as InspectionResult) : null;
    } catch {
      return null;
    }
  }, [inspectionId]);

  if (!result) {
    navigate('/work-orders', { replace: true });
    return null;
  }

  return (
    <div className="container mx-auto px-3 py-3">
      <InspectionResults
        result={result}
        onNewInspection={() => navigate('/work-orders')}
        onBackToTemplates={() => navigate('/work-orders')}
      />
    </div>
  );
}


