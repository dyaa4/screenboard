import {
  Route,
  BrowserRouter as Router,
  Routes,
  useLocation,
} from 'react-router-dom';
import 'reflect-metadata';

import Layout from '@components/navLayout/NavLayout';
import ProtectedRoute from '@components/ProtectedRoute/ProtectedRoute';
import Config from '@sites/Config/Config';

import {
  ROUTE_ABOUT_US,
  ROUTE_CONFIG,
  ROUTE_DASHBOARD,
  ROUTE_DASHBOARD_ID,
  ROUTE_DASHBOARDS,
  ROUTE_HOME,
  ROUTE_IMPRINT,
  ROUTE_LIVE_INTERACTION,
  ROUTE_PRICE,
  ROUTE_PRIVACY_POLICY,
  ROUTE_SMARTTHINGS_CALLBACK,
  ROUTE_SPOTIFY_CALLBACK,
} from '@common/routes';
import AboutUs from '@sites/AboutUs/AboutUs';
import Dashboard from '@sites/Dashboard/Dashboard';
import Dashboards from '@sites/Dashboards/Dashboards';
import Home from '@sites/Home/Home';
import Imprint from '@sites/Imprint/Imprint';
import LiveInteraction from '@sites/LiveInteraction/LiveInteraction';
import LoginCallback from '@sites/LoginCallback/LoginCallback';
import NotFound from '@sites/NotFound/NotFound';
import Price from '@sites/Price/Price';
import PrivacyPolicy from '@sites/PrivacyPolicy/PrivacyPolicy';

import SpotifyCallback from '@sites/SpotifyCallback/SpotifyCallback';
import SmartThingsDone from '@sites/SmartThingsCallback/SmartThingsCallback';

const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isDashboardRoute = location.pathname.startsWith(ROUTE_DASHBOARD);
  const isSmartthingsCallback = location.pathname.startsWith(ROUTE_SMARTTHINGS_CALLBACK);

  return isDashboardRoute || isSmartthingsCallback ? children : <Layout>{children}</Layout>;
};

const Root = () => {
  return (
    <Router>
      <LayoutWrapper>
        <Routes>
          <Route path="*" element={<NotFound />} />
          <Route path={ROUTE_HOME} element={<Home />} />
          <Route
            path={ROUTE_CONFIG + ROUTE_DASHBOARD_ID}
            element={
              <ProtectedRoute>
                <Config />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTE_DASHBOARD + ROUTE_DASHBOARD_ID}
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTE_LIVE_INTERACTION}
            element={
              <ProtectedRoute>
                <LiveInteraction />
              </ProtectedRoute>
            }
          />

          <Route
            path={ROUTE_DASHBOARDS}
            element={
              <ProtectedRoute>
                <Dashboards />
              </ProtectedRoute>
            }
          />
          <Route
            path="/auth0-callback"
            element={<LoginCallback />}
          />

          <Route
            path={ROUTE_SPOTIFY_CALLBACK}
            element={
              <ProtectedRoute>
                <SpotifyCallback />
              </ProtectedRoute>
            }
          />

          <Route path={ROUTE_SMARTTHINGS_CALLBACK} element={<SmartThingsDone />} />

          <Route path={ROUTE_PRICE} element={<Price />} />
          <Route path={ROUTE_PRIVACY_POLICY} element={<PrivacyPolicy />} />
          <Route path={ROUTE_IMPRINT} element={<Imprint />} />
          <Route path={ROUTE_ABOUT_US} element={<AboutUs />} />
        </Routes>
      </LayoutWrapper>
    </Router>
  );
};

export default Root;
