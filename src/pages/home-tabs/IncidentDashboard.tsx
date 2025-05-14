import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
  IonButton, IonToast, IonItem, IonLabel, IonSelect, 
  IonSelectOption, IonCard, IonCardHeader, IonCardTitle,
  IonCardContent, IonTextarea, IonInput, IonImg, IonSpinner
} from '@ionic/react';
import { useState } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { Camera, CameraResultType } from '@capacitor/camera';

interface Incident {
  id?: number;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'reported';
  location: string;
  image_url?: string;
}

const IncidentReport: React.FC = () => {
  const [incident, setIncident] = useState<Incident>({
    title: '',
    description: '',
    severity: 'medium',
    status: 'reported',
    location: 'Main Building'
  });
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const locations = [
    'Main Building', 'Science Lab', 'Library', 
    'Sports Field', 'Cafeteria', 'Parking Lot'
  ];

  const takePhoto = async () => {
    try {
      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl
      });
      setImage(photo.dataUrl || null);
    } catch (error) {
      console.error('Camera error:', error);
      setMessage('Failed to take photo');
    }
  };

  const uploadImage = async (imageData: string) => {
    try {
      // Get current user session
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Not authenticated');

      // Convert data URL to blob
      const response = await fetch(imageData);
      const blob = await response.blob();
      
      // Generate unique filename
      const fileExt = imageData.split(';')[0].split('/')[1] || 'png';
      const fileName = `incidents/${user.id}/${Date.now()}.${fileExt}`;
      
      // Upload to storage
      const { data, error: uploadError } = await supabase.storage
        .from('incident-images')
        .upload(fileName, blob);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('incident-images')
        .getPublicUrl(fileName);

      if (!publicUrl) throw new Error('Could not get public URL');
      
      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error('Failed to upload image');
    }
  };

  const handleSubmit = async () => {
    // Validate form
    if (!incident.title.trim()) {
      setMessage('Please enter a title for the incident');
      return;
    }
    
    if (!incident.description.trim()) {
      setMessage('Please describe the incident');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Get current user session
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (!user || authError) {
        throw new Error('Please sign in to report incidents');
      }

      // Upload image if exists
      let imageUrl = '';
      if (image) {
        imageUrl = await uploadImage(image);
      }

      // Submit incident data
      const { error } = await supabase.from('incidents').insert([
        {
          title: incident.title,
          description: incident.description,
          severity: incident.severity,
          status: 'reported',
          location: incident.location,
          image_url: imageUrl,
          reported_by: user.id
        }
      ]);

      if (error) throw error;

      // Reset form on success
      setMessage('Incident reported successfully!');
      setIncident({
        title: '',
        description: '',
        severity: 'medium',
        status: 'reported',
        location: 'Main Building'
      });
      setImage(null);
      
    } catch (error: any) {
      console.error('Submission error:', error);
      setMessage(error.message || 'Failed to report incident. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>NBSC Incident Report</IonTitle>
          </IonToolbar>
        </IonHeader>
  
        <IonContent className="ion-padding">
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Report Incident</IonCardTitle>
            </IonCardHeader>
  
            <IonCardContent>
              <IonItem>
                <IonLabel position="stacked">Title*</IonLabel>
                <IonInput
                  value={incident.title}
                  onIonChange={e => setIncident({...incident, title: e.detail.value!})}
                  placeholder="Brief incident title"
                />
              </IonItem>
  
              <IonItem>
                <IonLabel position="stacked">Description*</IonLabel>
                <IonTextarea
                  value={incident.description}
                  onIonChange={e => setIncident({...incident, description: e.detail.value!})}
                  rows={4}
                  placeholder="Describe what happened"
                />
              </IonItem>
  
              <IonItem>
                <IonLabel position="stacked">Location</IonLabel>
                <IonSelect
                  value={incident.location}
                  onIonChange={e => setIncident({...incident, location: e.detail.value})}
                >
                  {locations.map(loc => (
                    <IonSelectOption key={loc} value={loc}>{loc}</IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
  
              <IonItem>
                <IonLabel position="stacked">Severity</IonLabel>
                <IonSelect
                  value={incident.severity}
                  onIonChange={e => setIncident({...incident, severity: e.detail.value})}
                >
                  <IonSelectOption value="low">Low</IonSelectOption>
                  <IonSelectOption value="medium">Medium</IonSelectOption>
                  <IonSelectOption value="high">High</IonSelectOption>
                  <IonSelectOption value="critical">Critical</IonSelectOption>
                </IonSelect>
              </IonItem>
  
              <div className="ion-margin-vertical">
                <IonButton expand="block" onClick={takePhoto}>
                  {image ? 'Retake Photo' : 'Add Photo'}
                </IonButton>
                
                {image && (
                  <IonImg 
                    src={image} 
                    style={{ 
                      marginTop: '10px', 
                      maxHeight: '200px', 
                      objectFit: 'cover',
                      borderRadius: '8px'
                    }}
                  />
                )}
              </div>
  
              <IonButton 
                expand="block" 
                onClick={handleSubmit}
                disabled={loading || !incident.title.trim() || !incident.description.trim()}
              >
                {loading ? <IonSpinner name="crescent" /> : 'Submit Report'}
              </IonButton>
            </IonCardContent>
          </IonCard>
  
          <IonToast
            isOpen={!!message}
            message={message}
            duration={5000}
            onDidDismiss={() => setMessage('')}
            color={message.includes('success') ? 'success' : 'danger'}
          />
        </IonContent>
      </IonPage>
    );
  };
  
  export default IncidentReport;