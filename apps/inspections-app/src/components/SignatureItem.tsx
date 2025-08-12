import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { PenTool, Check } from 'lucide-react';
import { InspectionItem } from '@/types/inspection';

interface SignatureItemProps {
  item: InspectionItem;
  value: boolean | undefined;
  onUpdate: (value: boolean) => void;
}

export function SignatureItem({ item, value, onUpdate }: SignatureItemProps) {
  const [signatureName, setSignatureName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSign = () => {
    if (signatureName.trim()) {
      onUpdate(true);
      setIsDialogOpen(false);
    }
  };

  const handleClear = () => {
    onUpdate(false);
    setSignatureName('');
  };

  return (
    <Card className="shadow-sm border-0 bg-white" data-anchor={value ? "complete-item" : "incomplete-item"}>
      <CardContent className="p-6">
        <div className="space-y-4">
          <Label className="text-lg font-medium leading-relaxed text-foreground">
            {item.label}
            {item.options?.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          
          <div className="flex items-center gap-4">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant={value ? "secondary" : "outline"}
                  className="flex items-center gap-2"
                >
                  <PenTool className="h-4 w-4" />
                  {value ? "Signed" : "Add Signature"}
                  {value && <Check className="h-4 w-4 text-green-600" />}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Digital Signature</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="signature-name">Enter your full name</Label>
                    <Input
                      id="signature-name"
                      value={signatureName}
                      onChange={(e) => setSignatureName(e.target.value)}
                      placeholder="Full Name"
                      className="mt-2"
                    />
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg border-2 border-dashed text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      Digital signature placeholder
                    </p>
                    <div className="h-20 flex items-center justify-center">
                      <span className="text-lg font-signature text-foreground">
                        {signatureName || 'Your signature will appear here'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSign} disabled={!signatureName.trim()} className="flex-1">
                      Sign
                    </Button>
                    <Button variant="outline" onClick={handleClear}>
                      Clear
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            {value && (
              <div className="text-sm text-green-600 font-medium">
                ✓ Signature captured
              </div>
            )}
          </div>

          {/* Signature items typically don't need contextual actions */}
        </div>
      </CardContent>
    </Card>
  );
}