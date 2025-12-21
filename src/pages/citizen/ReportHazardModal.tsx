import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { mockRegions } from '@/data/mockData';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormMessage } from '@/components/common/FormMessage';
import { Upload, MapPin, Brain, Loader2 } from 'lucide-react';
import { SeverityBadge } from '@/components/common/StatusBadge';

interface ReportHazardModalProps {
  open: boolean;
  onClose: () => void;
}

const sampleImages = [
  'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format',
  'https://images.unsplash.com/photo-1605106702734-205df224ecce?w=800&auto=format',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format',
];

export function ReportHazardModal({ open, onClose }: ReportHazardModalProps) {
  const { user } = useAuth();
  const { addReport } = useData();

  const [step, setStep] = useState<'form' | 'analyzing' | 'result'>('form');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    region: user?.region || '',
    imageUrl: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [createdReport, setCreatedReport] = useState<any>(null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Location address is required';
    }
    if (!formData.region) {
      newErrors.region = 'Region is required';
    }
    if (!formData.imageUrl) {
      newErrors.imageUrl = 'Please select or upload an image';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !user) return;

    setStep('analyzing');

    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const report = addReport({
      reportedBy: user.id,
      reporterName: user.name,
      title: formData.title,
      description: formData.description,
      imageUrl: formData.imageUrl,
      location: {
        lat: 40.7128 + (Math.random() - 0.5) * 0.1,
        lng: -74.006 + (Math.random() - 0.5) * 0.1,
        address: formData.address,
        region: formData.region,
      },
    });

    setCreatedReport(report);
    setStep('result');
    setSuccess(true);
  };

  const handleClose = () => {
    setStep('form');
    setFormData({
      title: '',
      description: '',
      address: '',
      region: user?.region || '',
      imageUrl: '',
    });
    setErrors({});
    setSuccess(false);
    setCreatedReport(null);
    onClose();
  };

  const hazardTypeLabels: Record<string, string> = {
    pothole: 'Pothole',
    crack: 'Road Crack',
    flooding: 'Flooding',
    debris: 'Debris',
    damaged_signage: 'Damaged Signage',
    broken_barrier: 'Broken Barrier',
    uneven_surface: 'Uneven Surface',
    erosion: 'Erosion',
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {step === 'form' && 'Report Road Hazard'}
            {step === 'analyzing' && 'Analyzing Image'}
            {step === 'result' && 'Report Submitted'}
          </DialogTitle>
        </DialogHeader>

        {step === 'form' && (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">Hazard Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Large pothole on Main Street"
              />
              {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the hazard, its size, and any immediate dangers..."
                rows={3}
              />
              {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
            </div>

            <div className="space-y-2">
              <Label>Hazard Image *</Label>
              <div className="grid grid-cols-3 gap-2">
                {sampleImages.map((url, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, imageUrl: url }))}
                    className={`aspect-video rounded-lg overflow-hidden border-2 transition-colors ${
                      formData.imageUrl === url ? 'border-accent' : 'border-transparent hover:border-border'
                    }`}
                  >
                    <img src={url} alt={`Sample ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Select a sample image for demo purposes</p>
              {errors.imageUrl && <p className="text-xs text-destructive">{errors.imageUrl}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Location Address *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter street address or intersection"
                  className="pl-10"
                />
              </div>
              {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
            </div>

            <div className="space-y-2">
              <Label>Region *</Label>
              <Select
                value={formData.region}
                onValueChange={(value) => setFormData(prev => ({ ...prev, region: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {mockRegions.map(region => (
                    <SelectItem key={region.id} value={region.name}>
                      {region.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.region && <p className="text-xs text-destructive">{errors.region}</p>}
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button variant="accent" onClick={handleSubmit} className="flex-1">
                <Upload className="h-4 w-4" />
                Submit Report
              </Button>
            </div>
          </div>
        )}

        {step === 'analyzing' && (
          <div className="py-12 text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <Brain className="h-16 w-16 text-accent" />
                <Loader2 className="h-8 w-8 text-accent absolute -right-2 -bottom-2 animate-spin" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">Analyzing Image</h3>
            <p className="text-muted-foreground">
              Our AI is identifying the hazard type and severity...
            </p>
          </div>
        )}

        {step === 'result' && createdReport && (
          <div className="space-y-6">
            <FormMessage type="success" message="Your hazard report has been submitted successfully!" />

            <div className="rounded-lg border border-border overflow-hidden">
              <div className="aspect-video">
                <img
                  src={createdReport.imageUrl}
                  alt={createdReport.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium text-foreground">AI Analysis Results</span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Hazard Type</p>
                  <p className="font-medium text-foreground">
                    {hazardTypeLabels[createdReport.aiAnalysis.hazardType]}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Severity</p>
                  <SeverityBadge severity={createdReport.aiAnalysis.severity} />
                </div>
                <div>
                  <p className="text-muted-foreground">Confidence</p>
                  <p className="font-medium text-foreground">
                    {Math.round(createdReport.aiAnalysis.confidence * 100)}%
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Priority</p>
                  <p className="font-medium text-foreground">
                    Level {createdReport.aiAnalysis.suggestedPriority}
                  </p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground border-t border-border pt-3">
                {createdReport.aiAnalysis.description}
              </p>
            </div>

            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
