import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
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
import { FormMessage } from '@/components/common/FormMessage';
import { LocationCascade } from '@/components/common/LocationCascade';
import { Upload, MapPin, Brain, Loader2, Camera, X, LocateFixed } from 'lucide-react';
import { SeverityBadge } from '@/components/common/StatusBadge';
import { supabase } from '@/integrations/supabase/client';

interface ReportHazardModalProps {
  open: boolean;
  onClose: () => void;
}

export function ReportHazardModal({ open, onClose }: ReportHazardModalProps) {
  const { user } = useAuth();
  const { addReport } = useData();

  const [step, setStep] = useState<'form' | 'analyzing' | 'result'>('form');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    state: '',
    district: '',
    mandal: '',
    stateId: null as number | null,
    districtId: null as number | null,
    lat: '',
    lng: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [createdReport, setCreatedReport] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.address.trim()) newErrors.address = 'Location address is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.district) newErrors.district = 'District is required';
    if (!formData.mandal) newErrors.mandal = 'Mandal is required';
    if (!imageFile) newErrors.image = 'Please upload a hazard photo';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, image: 'Please select an image file' }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, image: 'Image must be under 5MB' }));
      return;
    }
    setImageFile(file);
    setErrors(prev => { const { image, ...rest } = prev; return rest; });
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setErrors(prev => ({ ...prev, location: 'Geolocation not supported by your browser' }));
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          lat: position.coords.latitude.toFixed(6),
          lng: position.coords.longitude.toFixed(6),
        }));
        setErrors(prev => { const { location, ...rest } = prev; return rest; });
        setLocating(false);
      },
      () => {
        setErrors(prev => ({ ...prev, location: 'Could not get location. Please allow location access.' }));
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile || !user) return null;
    const ext = imageFile.name.split('.').pop();
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('hazard-images').upload(path, imageFile);
    if (error) return null;
    const { data } = supabase.storage.from('hazard-images').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !user) return;
    setStep('analyzing');
    setUploading(true);

    const imageUrl = await uploadImage();
    setUploading(false);

    if (!imageUrl) {
      setStep('form');
      setErrors(prev => ({ ...prev, image: 'Failed to upload image. Please try again.' }));
      return;
    }

    const lat = formData.lat ? parseFloat(formData.lat) : 20.5937 + (Math.random() - 0.5) * 0.1;
    const lng = formData.lng ? parseFloat(formData.lng) : 78.9629 + (Math.random() - 0.5) * 0.1;

    const report = await addReport({
      reportedBy: user.id,
      reporterName: user.name,
      title: formData.title,
      description: formData.description,
      imageUrl,
      location: {
        lat,
        lng,
        address: formData.address,
        region: `${formData.mandal}, ${formData.district}`,
        state: formData.state,
        district: formData.district,
        mandal: formData.mandal,
      },
    });

    if (report) {
      setCreatedReport(report);
      setStep('result');
      setSuccess(true);
    }
  };

  const handleClose = () => {
    setStep('form');
    setFormData({ title: '', description: '', address: '', state: '', district: '', mandal: '', stateId: null, districtId: null, lat: '', lng: '' });
    setImageFile(null);
    setImagePreview(null);
    setErrors({});
    setSuccess(false);
    setCreatedReport(null);
    onClose();
  };

  const hazardTypeLabels: Record<string, string> = {
    pothole: 'Pothole', crack: 'Road Crack', flooding: 'Flooding', debris: 'Debris',
    damaged_signage: 'Damaged Signage', broken_barrier: 'Broken Barrier',
    uneven_surface: 'Uneven Surface', erosion: 'Erosion',
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 'form' && 'Report Road Hazard'}
            {step === 'analyzing' && 'Uploading & Analyzing'}
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
              <Label>Hazard Photo *</Label>
              {imagePreview ? (
                <div className="relative rounded-lg overflow-hidden border border-border">
                  <img src={imagePreview} alt="Preview" className="w-full aspect-video object-cover" />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full p-1.5 hover:bg-background transition-colors"
                  >
                    <X className="h-4 w-4 text-foreground" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-video rounded-lg border-2 border-dashed border-border hover:border-accent flex flex-col items-center justify-center gap-2 transition-colors bg-muted/30"
                >
                  <Camera className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Click to upload a photo</span>
                  <span className="text-xs text-muted-foreground">JPG, PNG up to 5MB</span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              {errors.image && <p className="text-xs text-destructive">{errors.image}</p>}
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

            {/* GPS Location */}
            <div className="space-y-2">
              <Label>GPS Coordinates</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGetLocation}
                  disabled={locating}
                  className="shrink-0"
                >
                  {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
                  {locating ? 'Getting...' : 'Use My Location'}
                </Button>
                <Input
                  value={formData.lat}
                  onChange={(e) => setFormData(prev => ({ ...prev, lat: e.target.value }))}
                  placeholder="Latitude"
                  className="flex-1"
                />
                <Input
                  value={formData.lng}
                  onChange={(e) => setFormData(prev => ({ ...prev, lng: e.target.value }))}
                  placeholder="Longitude"
                  className="flex-1"
                />
              </div>
              {formData.lat && formData.lng && (
                <p className="text-xs text-success">📍 Location captured: {formData.lat}, {formData.lng}</p>
              )}
              {errors.location && <p className="text-xs text-destructive">{errors.location}</p>}
            </div>

            {/* State / District / Mandal */}
            <LocationCascade
              state={formData.state}
              district={formData.district}
              mandal={formData.mandal}
              stateId={formData.stateId}
              onStateChange={(name, id) => setFormData(prev => ({ ...prev, state: name, stateId: id, district: '', districtId: null, mandal: '' }))}
              onDistrictChange={(name, id) => setFormData(prev => ({ ...prev, district: name, districtId: id, mandal: '' }))}
              onMandalChange={(name) => setFormData(prev => ({ ...prev, mandal: name }))}
              errors={errors}
            />

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={handleClose} className="flex-1">Cancel</Button>
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
            <h3 className="text-lg font-medium text-foreground mb-2">
              {uploading ? 'Uploading Image...' : 'Analyzing Image'}
            </h3>
            <p className="text-muted-foreground">
              {uploading ? 'Uploading your hazard photo...' : 'Our AI is identifying the hazard type and severity...'}
            </p>
          </div>
        )}

        {step === 'result' && createdReport && (
          <div className="space-y-6">
            <FormMessage type="success" message="Your hazard report has been submitted successfully!" />
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="aspect-video">
                <img src={createdReport.imageUrl} alt={createdReport.title} className="w-full h-full object-cover" />
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
                  <p className="font-medium text-foreground">{hazardTypeLabels[createdReport.aiAnalysis.hazardType]}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Severity</p>
                  <SeverityBadge severity={createdReport.aiAnalysis.severity} />
                </div>
                <div>
                  <p className="text-muted-foreground">Confidence</p>
                  <p className="font-medium text-foreground">{Math.round(createdReport.aiAnalysis.confidence * 100)}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Priority</p>
                  <p className="font-medium text-foreground">Level {createdReport.aiAnalysis.suggestedPriority}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground border-t border-border pt-3">{createdReport.aiAnalysis.description}</p>
            </div>
            <Button onClick={handleClose} className="w-full">Done</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
