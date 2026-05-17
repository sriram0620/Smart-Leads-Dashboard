import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import LeadsList from '@/pages/LeadsList';
import LeadDetail from '@/pages/LeadDetail';
import LeadForm from '@/pages/LeadForm';
import Analytics from '@/pages/Analytics';
import { Toaster } from '@/components/ui/sonner';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="leads" element={<LeadsList />} />
            <Route path="leads/add" element={<LeadForm />} />
            <Route path="leads/:id" element={<LeadDetail />} />
            <Route path="leads/:id/edit" element={<LeadForm />} />
            <Route path="analytics" element={<Analytics />} />
          </Route>
        </Routes>
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
