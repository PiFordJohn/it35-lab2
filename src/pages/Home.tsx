import { 
  IonButton,
  IonButtons,
  IonContent, 
  IonHeader,
  IonIcon, 
  IonLabel, 
  IonMenuButton, 
  IonPage,
  IonRouterOutlet, 
  IonTabBar, 
  IonTabButton, 
  IonTabs,  
  IonTitle, 
  IonToolbar,
  IonAvatar,
  IonItem,
  IonPopover,
  IonImg
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { bookOutline, star, personCircle } from 'ionicons/icons';
import { Route, Redirect } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';

import IncidentDashboard from './home-tabs/IncidentDashboard';
import UserIncidentReports from './home-tabs/UserIncidentReports';

const Home: React.FC = () => {
  const tabs = [
    {name:'IncidentDashboard', tab:'IncidentDashboard', url: '/TRA-Manolo-Fortich/app/home/IncidentDashboard', icon: bookOutline},
    {name:'UserIncidentReports', tab:'UserIncidentReports', url: '/TRA-Manolo-Fortich/app/home/UserIncidentReports', icon: star},
  ];

  const [user, setUser] = useState<any>(null);
  const [showProfilePopover, setShowProfilePopover] = useState(false);
  const [popoverEvent, setPopoverEvent] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error getting user:', error);
        return;
      }
      
      if (user) {
        setUser(user);
        
        // Fetch additional profile data
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (!profileError && profile) {
          setUser((prev: any) => ({ ...prev, profile }));
        }
      }
    };

    fetchUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Sign out error:', error);
    setShowProfilePopover(false);
  };

  const openProfilePopover = (e: any) => {
    setPopoverEvent(e);
    setShowProfilePopover(true);
  };

  // Helper function to get user avatar URL
  const getAvatarUrl = () => {
    if (user?.profile?.avatar_url) {
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(user.profile.avatar_url);
      return publicUrl;
    }
    return user?.user_metadata?.avatar_url;
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Home</IonTitle>
          <IonButtons slot="end">
            {user ? (
              <IonButton onClick={openProfilePopover}>
                {getAvatarUrl() ? (
                  <IonAvatar slot="icon-only" style={{ width: '32px', height: '32px' }}>
                    <IonImg 
                      src={getAvatarUrl()} 
                      alt="Profile"
                      onIonError={(e) => console.error('Avatar load error:', e)}
                    />
                  </IonAvatar>
                ) : (
                  <IonIcon icon={personCircle} slot="icon-only" size="large" />
                )}
              </IonButton>
            ) : (
              <IonButton routerLink="/login">Login</IonButton>
            )}
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonPopover
        isOpen={showProfilePopover}
        event={popoverEvent}
        onDidDismiss={() => setShowProfilePopover(false)}
      >
        <IonContent className="ion-padding">
          {user && (
            <div style={{ textAlign: 'center' }}>
              {getAvatarUrl() ? (
                <IonAvatar style={{ width: '80px', height: '80px', margin: '0 auto' }}>
                  <IonImg 
                    src={getAvatarUrl()} 
                    alt="Profile"
                    onIonError={(e) => console.error('Avatar load error:', e)}
                  />
                </IonAvatar>
              ) : (
                <IonIcon icon={personCircle} size="large" style={{ fontSize: '80px' }} />
              )}
              
              <h2>{user.email}</h2>
              <p>{user.user_metadata?.full_name || user.profile?.full_name || 'User'}</p>
              
              <IonButton 
               expand="block" 
               fill="clear" 
               routerLink="/TRA-Manolo-Fortich/app/profile"
               onClick={() => setShowProfilePopover(false)}
              >
               View Profile
              </IonButton>
              
              <IonButton 
                expand="block" 
                fill="clear" 
                color="danger" 
                onClick={handleSignOut}
              >
                Sign Out
              </IonButton>
            </div>
          )}
        </IonContent>
      </IonPopover>

      <IonContent fullscreen>
        <IonReactRouter>
          <IonTabs>
            <IonRouterOutlet>
              <Route exact path="/TRA-Manolo-Fortich/app/home/IncidentDashboard" component={IncidentDashboard} />
              <Route exact path="/TRA-Manolo-Fortich/app/home/UserIncidentReports" component={UserIncidentReports} />
              <Route exact path="/TRA-Manolo-Fortich/app/home">
                <Redirect to="/TRA-Manolo-Fortich/app/home/IncidentDashboard" />
              </Route>
            </IonRouterOutlet>

            <IonTabBar slot="bottom">
              {tabs.map((item, index) => (
                <IonTabButton key={index} tab={item.tab} href={item.url}>
                  <IonIcon icon={item.icon} />
                  <IonLabel>{item.name}</IonLabel>
                </IonTabButton>
              ))}
            </IonTabBar>
          </IonTabs>
        </IonReactRouter>
      </IonContent>
    </IonPage>
  );
};

export default Home;