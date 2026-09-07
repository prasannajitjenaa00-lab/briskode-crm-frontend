import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { MainLayout } from './components/layout/MainLayout';
import { LoginScreen } from './components/auth/LoginScreen';

import { AppLoader } from './components/common/AppLoader';

const Gate = () => {
  const { currentUser, authLoading, isDataLoading } = useApp();

  if (authLoading || (currentUser && isDataLoading)) {
    return (
      <AppLoader 
        message={authLoading ? 'Authenticating session...' : 'Loading CRM Command Center...'} 
      />
    );
  }

  if (!currentUser) {
    return <LoginScreen />;
  }

  return <MainLayout />;
};

export const App = () => {
  return (
    <AppProvider>
      <Gate />
    </AppProvider>
  );
};

export default App;
