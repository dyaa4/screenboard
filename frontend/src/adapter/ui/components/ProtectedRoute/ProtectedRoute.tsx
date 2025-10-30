import { useAuth } from '@adapter/ui/contexts/AuthContext';
import { Spinner } from '@heroui/react';
import React from 'react';
import { Navigate } from 'react-router';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    if (!isLoading) {
      setIsReady(true);
    }
  }, [isLoading]);

  // Prüfen Sie, ob wir uns im Callback-Flow befinden
  const isInAuthFlow =
    location.search.includes('code=') && location.search.includes('state=');

  if (!isReady) {
    return (
      <Spinner
        style={{
          margin: 'auto',
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}
      />
    );
  }

  // Erlauben Sie den Zugriff wenn wir im Auth-Flow sind
  if (isInAuthFlow) {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoute;
