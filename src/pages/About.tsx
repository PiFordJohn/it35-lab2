import { 
    IonButtons,
      IonCard,
      IonCardContent,
      IonCardHeader,
      IonCardSubtitle,
      IonCardTitle,
      IonContent, 
      IonHeader, 
      IonImg, 
      IonMenuButton, 
      IonPage, 
      IonTitle, 
      IonToolbar 
  } from '@ionic/react';
  
  const About: React.FC = () => {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot='start'>
              <IonMenuButton></IonMenuButton>
            </IonButtons>
            <IonTitle>About</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className='ion-padding'>
        <IonCard className="profile-card">
      <IonCardHeader>
        <IonCardTitle>Incident Reporting App</IonCardTitle>
        <IonCardSubtitle>Northern Bukidnon State College</IonCardSubtitle>
      </IonCardHeader>

      <IonCardContent>
The NBSC Incident Reporting App allows students and staff to quickly report safety hazards, maintenance issues, or emergencies within the school premises. Users can submit incidents with photos, descriptions, and location details for efficient tracking and resolution.  
<br></br>
<br></br>
Key Benefits
<br></br>
<br></br>
✅ Quick Reporting – Easily document incidents with images and details in seconds.<br></br> 
✅ Real-Time Tracking – Monitor incident status (Reported → Investigating → Resolved).<br></br>
✅ Improved Safety – Faster response to hazards enhances campus security.<br></br>  
✅ Accountability – Ensures issues are logged and addressed by the right personnel.<br></br>  
✅ User-Friendly – Simple interface for seamless reporting on mobile or desktop.<br></br>  
<br></br>
Perfect for maintaining a safe and well-managed school environment! 🏫🔧📱</IonCardContent>
    </IonCard>
        </IonContent>
      </IonPage>
    );
  };
  
  export default About;