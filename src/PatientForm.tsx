
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface PatientFormProps {
  onPatientCreated: () => void;
}

export const PatientForm = ({ onPatientCreated }: PatientFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      
      const { error } = await supabase
        .from('patients')
        .insert({
          user_id: user.id,
          patient_id: formData.get('patientId') as string,
          medical_history: formData.get('medicalHistory') as string,
          allergies: formData.get('allergies') as string,
          current_medications: formData.get('medications') as string,
          emergency_contact_name: formData.get('emergencyName') as string,
          emergency_contact_phone: formData.get('emergencyPhone') as string,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Patient profile created successfully!"
      });

      onPatientCreated();
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create patient profile",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Create Patient Profile
        </CardTitle>
        <CardDescription>
          Create a new patient profile to start uploading MRI scans
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="patientId">Patient ID *</Label>
            <Input
              id="patientId"
              name="patientId"
              placeholder="Enter unique patient ID"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="medicalHistory">Medical History</Label>
            <Textarea
              id="medicalHistory"
              name="medicalHistory"
              placeholder="Enter relevant medical history..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="allergies">Allergies</Label>
              <Textarea
                id="allergies"
                name="allergies"
                placeholder="List any known allergies..."
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="medications">Current Medications</Label>
              <Textarea
                id="medications"
                name="medications"
                placeholder="List current medications..."
                rows={2}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emergencyName">Emergency Contact Name</Label>
              <Input
                id="emergencyName"
                name="emergencyName"
                placeholder="Emergency contact name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
              <Input
                id="emergencyPhone"
                name="emergencyPhone"
                type="tel"
                placeholder="Emergency contact phone"
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Patient Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
