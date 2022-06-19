import React, { useContext, useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { navigationRef } from "./navigation";
import { onAuthStateChanged } from 'firebase/auth';
import { AuthStack } from './AuthStack';
import { AppStack } from './AppStack';
import { AuthenticatedUserContext } from '../providers';
import { LoadingIndicator } from '../components';
import { auth } from '../config';

export const RootNavigator = () => {
  const { user, setUser } = useContext(AuthenticatedUserContext);
  const [isLoading, setIsLoading] = useState(true);

  useEffect( () => {
    // unsubscribe auth listener on unmount
    return onAuthStateChanged(
        auth,
        authenticatedUser => {
          authenticatedUser ? setUser(authenticatedUser) : setUser(null);
          setIsLoading(false);
        }
    );
  }, []);

  if (isLoading) {
    return <LoadingIndicator />;
  }

  return ( // navigate to app iff user is authorized
    <NavigationContainer ref={navigationRef}>
      {user ? <AppStack /> : <AuthStack />} 
    </NavigationContainer>
  );
};
