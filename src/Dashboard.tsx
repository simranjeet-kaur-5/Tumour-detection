
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Header } from './Header';
import { PatientForm } from '../patient/PatientForm';
import { ScanUpload } from '../scan/ScanUpload';
import { ScanHistory } from '../scan/ScanHistory';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Upload, History, Brain } from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const { data: patients, refetch: refetchPatients } = useQuery({
    queryKey: ['patients', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const { data: scans, refetch: refetchScans } = useQuery({
    queryKey: ['scans', selectedPatientId],
    queryFn: async () => {
      if (!selectedPatientId) return [];
      const { data, error } = await supabase
        .from('scans')
        .select(`
          *,
          predictions (*)
        `)
        .eq('patient_id', selectedPatientId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedPatientId
  });

  useEffect(() => {
    if (patients && patients.length > 0 && !selectedPatientId) {
      setSelectedPatientId(patients[0].id);
    }
  }, [patients, selectedPatientId]);

  const handlePatientCreated = () => {
    refetchPatients();
  };

  const handleScanUploaded = () => {
    refetchScans();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.user_metadata?.full_name || 'User'}
          </h2>
          <p className="text-gray-600">
            Manage patient data and analyze brain MRI scans with AI-powered detection.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="flex items-center p-6">
              <Users className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Patients</p>
                <p className="text-2xl font-bold">{patients?.length || 0}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-6">
              <Upload className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Scans</p>
                <p className="text-2xl font-bold">{scans?.length || 0}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-6">
              <Brain className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">AI Analyses</p>
                <p className="text-2xl font-bold">
                  {scans?.filter(scan => scan.predictions && scan.predictions.length > 0).length || 0}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-6">
              <History className="h-8 w-8 text-orange-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold">
                  {scans?.filter(scan => scan.status === 'pending').length || 0}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {!patients || patients.length === 0 ? (
              <PatientForm onPatientCreated={handlePatientCreated} />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Your Patients
                  </CardTitle>
                  <CardDescription>
                    Select a patient to view scans and upload new ones
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {patients.map((patient) => (
                      <div
                        key={patient.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedPatientId === patient.id
                            ? 'bg-blue-50 border-blue-200'
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedPatientId(patient.id)}
                      >
                        <p className="font-medium">Patient ID: {patient.patient_id}</p>
                        <p className="text-sm text-gray-500">
                          Created: {new Date(patient.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedPatientId && (
              <ScanUpload 
                patientId={selectedPatientId} 
                onScanUploaded={handleScanUploaded}
              />
            )}
          </div>

          {/* Right Column */}
          <div>
            {selectedPatientId && (
              <ScanHistory scans={scans || []} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
