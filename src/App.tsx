import React from 'react';
import { Switch, Route, Router as WouterRouter } from 'wouter';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import PageTransition from './components/ui/PageTransition';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Charities from './pages/Charities';
import CharityDetail from './pages/CharityDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import Dashboard from './pages/Dashboard';
import UserDashboard from './pages/UserDashboard';
import AIChat from './pages/AIChat';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import AdminPanel from './pages/admin/AdminPanel';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import FAQ from './pages/FAQ';
import AuthPage from './pages/AuthPage';
import DonationPage from './components/shared/DonationModal';
import { RouteGuard } from './components/RouteGuard';
import { initScrollReveal } from './utils/scrollReveal';
import { useLocation } from 'wouter';
import { useEffect } from 'react';

function AppInner() {
  const [location] = useLocation();
  useEffect(() => {
    const t = setTimeout(() => initScrollReveal(), 150);
    return () => clearTimeout(t);
  }, [location]);
  return null;
}

function NotFound() {
  return (
    <PageTransition>
      <div className="notfound" style={{ paddingTop: 72 }}>
        <h1>404</h1>
        <h2>الصفحة غير موجودة</h2>
        <p>عذرًا، الصفحة التي تبحث عنها غير موجودة</p>
        <a href="/" className="btn-primary" style={{ display: 'inline-flex' }}>العودة للرئيسية</a>
      </div>
    </PageTransition>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/">
        <PageTransition><Home /></PageTransition>
      </Route>
      <Route path="/charities">
        <PageTransition><Charities /></PageTransition>
      </Route>
      <Route path="/charities/:id">
        <PageTransition><CharityDetail /></PageTransition>
      </Route>
      <Route path="/about">
        <PageTransition><About /></PageTransition>
      </Route>
      <Route path="/contact">
        <PageTransition><Contact /></PageTransition>
      </Route>
      <Route path="/privacy">
        <PageTransition><PrivacyPolicy /></PageTransition>
      </Route>
      <Route path="/terms">
        <PageTransition><Terms /></PageTransition>
      </Route>
      <Route path="/faq">
        <PageTransition><FAQ /></PageTransition>
      </Route>
      <Route path="/authModals">
        <PageTransition><AuthPage /></PageTransition>
      </Route>
      <Route path="/settings">
        <ProtectedRoute>
          <PageTransition><Settings /></PageTransition>
        </ProtectedRoute>
      </Route>
      <Route path="/notifications">
        <ProtectedRoute>
          <PageTransition><Notifications /></PageTransition>
        </ProtectedRoute>
      </Route>

      {/* ✅ Route التبرع الجديدة */}
      <Route path="/donate">
        <ProtectedRoute allowedRoles={['user']}>
          <PageTransition><DonationPage /></PageTransition>
        </ProtectedRoute>
      </Route>

      <Route path="/user-dashboard">
        <ProtectedRoute allowedRoles={['user']}>
          <PageTransition><UserDashboard /></PageTransition>
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard">
        <ProtectedRoute allowedRoles={['charity']}>
          <PageTransition><Dashboard /></PageTransition>
        </ProtectedRoute>
      </Route>
      <Route path="/admin">
        <ProtectedRoute allowedRoles={['admin']}>
          <PageTransition><AdminPanel /></PageTransition>
        </ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <AuthProvider>
      <WouterRouter base={import.meta.env.BASE_URL?.replace(/\/$/, '') || ''}>
        <RouteGuard />
        <AppInner />

        <Switch>
          {/* ── AIChat: بدون Navbar وFooter ── */}
          <Route path="/ai-chat">
            <ProtectedRoute>
              <AIChat />
            </ProtectedRoute>
          </Route>

          {/* ── باقي الصفحات: معها Navbar وFooter ── */}
          <Route>
            <Navbar />
            <main className="main-content">
              <Router />
            </main>
            <Footer />
          </Route>
        </Switch>

      </WouterRouter>
    </AuthProvider>
  );
}

export default App;