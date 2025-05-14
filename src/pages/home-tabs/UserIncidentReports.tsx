import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
  IonButton, IonToast, IonCard, IonCardHeader, IonCardTitle,
  IonCardContent, IonSpinner, IonBadge, IonLabel, IonItem, 
  IonGrid, IonRow, IonCol, IonAvatar, IonText, IonModal,
  IonButtons, IonIcon, IonRefresher, IonRefresherContent, IonImg
} from '@ionic/react';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { 
  timeOutline, locationOutline, alertCircleOutline, 
  close, eyeOutline 
} from 'ionicons/icons';
import { format } from 'date-fns';

interface Incident {
  id: number;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'reported' | 'investigating' | 'resolved' | 'closed';
  location: string;
  image_url?: string;
  created_at: string;
}

const UserIncidentReports: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const severityColors = {
    low: 'success',
    medium: 'warning',
    high: 'danger',
    critical: 'dark'
  };

  const statusColors = {
    reported: 'primary',
    investigating: 'warning',
    resolved: 'success',
    closed: 'medium'
  };

  const fetchUserIncidents = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      setUserId(user.id);

      // Fetch incidents reported by this user
      const { data, error: queryError } = await supabase
        .from('incidents')
        .select(`
          id, 
          title, 
          description, 
          severity, 
          status, 
          location, 
          image_url, 
          created_at
        `)
        .eq('reported_by', user.id)
        .order('created_at', { ascending: false });

      if (queryError) throw queryError;

      setIncidents(data || []);
    } catch (err) {
      console.error('Error fetching incidents:', err);
      setError('Failed to load your reported incidents');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = async (event: CustomEvent) => {
    await fetchUserIncidents();
    (event.target as HTMLIonRefresherElement).complete();
  };

  useEffect(() => {
    fetchUserIncidents();
  }, [fetchUserIncidents]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>My Reported Incidents</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        {loading && incidents.length === 0 ? (
          <div className="ion-text-center ion-padding">
            <IonSpinner name="crescent" />
          </div>
        ) : error ? (
          <div className="ion-text-center ion-padding" style={{ color: 'red' }}>
            {error}
          </div>
        ) : incidents.length === 0 ? (
          <div className="ion-text-center ion-padding">
            You haven't reported any incidents yet
          </div>
        ) : (
          <IonGrid className="ion-padding">
            {incidents.map(incident => (
              <IonRow key={incident.id}>
                <IonCol size="12">
                  <IonCard 
                    onClick={() => setSelectedIncident(incident)}
                    style={{ cursor: 'pointer' }}
                  >
                    <IonCardHeader>
                      <IonCardTitle>{incident.title}</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      <IonGrid>
                        <IonRow>
                          <IonCol size="4">
                            <IonText color="medium">
                              <IonIcon icon={locationOutline} /> {incident.location}
                            </IonText>
                          </IonCol>
                          <IonCol size="4">
                            <IonText color="medium">
                              <IonIcon icon={timeOutline} /> {format(new Date(incident.created_at), 'MMM dd, yyyy')}
                            </IonText>
                          </IonCol>
                          <IonCol size="4">
                            <IonBadge color={statusColors[incident.status]}>
                              {incident.status}
                            </IonBadge>
                          </IonCol>
                        </IonRow>
                        <IonRow className="ion-margin-top">
                          <IonCol>
                            <IonBadge color={severityColors[incident.severity]}>
                              Severity: {incident.severity}
                            </IonBadge>
                          </IonCol>
                        </IonRow>
                      </IonGrid>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              </IonRow>
            ))}
          </IonGrid>
        )}

        {/* Incident Detail Modal */}
        <IonModal 
          isOpen={!!selectedIncident} 
          onDidDismiss={() => setSelectedIncident(null)}
        >
          {selectedIncident && (
            <>
              <IonHeader>
                <IonToolbar>
                  <IonButtons slot="start">
                    <IonButton onClick={() => setSelectedIncident(null)}>
                      <IonIcon icon={close} />
                    </IonButton>
                  </IonButtons>
                  <IonTitle>{selectedIncident.title}</IonTitle>
                  <IonButtons slot="end">
                    <IonBadge color={severityColors[selectedIncident.severity]}>
                      {selectedIncident.severity}
                    </IonBadge>
                  </IonButtons>
                </IonToolbar>
              </IonHeader>
              <IonContent className="ion-padding">
                <IonGrid>
                  <IonRow>
                    <IonCol>
                      <IonText>
                        <h3>Description</h3>
                        <p>{selectedIncident.description}</p>
                      </IonText>
                    </IonCol>
                  </IonRow>

                  <IonRow>
                    <IonCol>
                      <IonItem>
                        <IonIcon icon={locationOutline} slot="start" />
                        <IonLabel>Location: {selectedIncident.location}</IonLabel>
                      </IonItem>
                    </IonCol>
                  </IonRow>

                  <IonRow>
                    <IonCol>
                      <IonItem>
                        <IonIcon icon={timeOutline} slot="start" />
                        <IonLabel>
                          Reported on: {format(new Date(selectedIncident.created_at), 'PPPpp')}
                        </IonLabel>
                      </IonItem>
                    </IonCol>
                  </IonRow>

                  <IonRow>
                    <IonCol>
                      <IonItem>
                        <IonIcon icon={alertCircleOutline} slot="start" />
                        <IonLabel>
                          Status: 
                          <IonBadge color={statusColors[selectedIncident.status]}>
                            {selectedIncident.status}
                          </IonBadge>
                        </IonLabel>
                      </IonItem>
                    </IonCol>
                  </IonRow>

                  {selectedIncident.image_url && (
                    <IonRow>
                      <IonCol>
                        <IonText>
                          <h3>Attached Image</h3>
                        </IonText>
                        <IonImg 
                          src={selectedIncident.image_url} 
                          style={{ 
                            borderRadius: '8px',
                            marginTop: '10px',
                            maxHeight: '300px',
                            objectFit: 'contain'
                          }}
                        />
                      </IonCol>
                    </IonRow>
                  )}
                </IonGrid>
              </IonContent>
            </>
          )}
        </IonModal>

        <IonToast
          isOpen={!!message}
          message={message}
          duration={3000}
          onDidDismiss={() => setMessage('')}
        />
      </IonContent>
    </IonPage>
  );
};

export default UserIncidentReports;