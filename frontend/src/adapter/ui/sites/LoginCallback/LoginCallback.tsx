import { useAuth0 } from '@auth0/auth0-react';
import { ROUTE_DASHBOARDS } from '@common/routes';
import { Button, Card, CardBody, Image, Spinner } from '@heroui/react';
import { motion } from 'framer-motion';
import { useEffect } from 'react';

const LoginCallback = () => {
  const { isAuthenticated, isLoading, error } = useAuth0();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        console.log(
          'Auth0 authentication successful, redirecting to:',
          ROUTE_DASHBOARDS,
        );
      } else if (error) {
        console.error('Auth0 callback error:', error);
      }
    }
  }, [isAuthenticated, isLoading, error]);

  const handleRetry = () => {};

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-default-50 to-default-100 dark:from-background dark:via-default-100 dark:to-default-200">
        <div className="max-w-md w-full mx-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="shadow-2xl">
              <CardBody className="p-8 gap-6">
                <div className="flex justify-center">
                  <Image
                    src="/images/logo-black.png"
                    alt="Screen Board Logo"
                    className="mx-auto dark:hidden"
                    width={300}
                    height={100}
                  />
                  <Image
                    src="/images/logo-white.png"
                    alt="Screen Board Logo"
                    className="mx-auto hidden dark:block"
                    width={300}
                    height={100}
                  />
                </div>

                <h1 className="text-3xl font-bold bg-gradient-to-r from-danger to-warning bg-clip-text text-transparent text-center">
                  Fehler bei der Anmeldung
                </h1>

                <div className="space-y-4">
                  <p className="text-center text-default-700 font-medium">
                    {error.message || 'Ein unbekannter Fehler ist aufgetreten.'}
                  </p>

                  <div className="flex justify-center pt-2">
                    <Button color="primary" size="lg" onPress={handleRetry}>
                      Zurück zur Startseite
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-default-50 to-default-100 dark:from-background dark:via-default-100 dark:to-default-200">
      <div className="max-w-md w-full mx-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="shadow-2xl">
            <CardBody className="p-8 gap-6">
              <div className="flex justify-center">
                <Image
                  src="/images/logo-black.png"
                  alt="Screen Board Logo"
                  className="mx-auto dark:hidden"
                  width={300}
                  height={100}
                />
                <Image
                  src="/images/logo-white.png"
                  alt="Screen Board Logo"
                  className="mx-auto hidden dark:block"
                  width={300}
                  height={100}
                />
              </div>

              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent text-center">
                Willkommen bei Screen Board
              </h1>

              <div className="space-y-4">
                <p className="text-center text-default-700 font-medium text-lg">
                  Anmeldung wird abgeschlossen...
                </p>

                <div className="flex justify-center pt-2">
                  <Spinner color="secondary" size="lg" />
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginCallback;
