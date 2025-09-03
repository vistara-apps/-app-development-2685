import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Payouts from './components/Payouts';
import ApiSettings from './components/ApiSettings';
import FraudDetection from './components/FraudDetection';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Login';
import { useAuth } from './context/AuthContext';

// Main app content component
const AppContent = () => {
  const { user, loading } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-purple-800 flex items-center justify-center">
        <div className="card p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Loading...</h2>
          <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!user) {
    return <Login />;
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'transactions':
        return <Transactions />;
      case 'payouts':
        return <Payouts />;
      case 'fraud':
        return <FraudDetection />;
      case 'api':
        return <ApiSettings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-purple-800">
      <div className="flex">
        <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        <main className="flex-1 min-h-screen p-6 ml-64">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

// Main App component with providers
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
