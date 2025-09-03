import React from 'react';
import { 
  LayoutDashboard, 
  CreditCard, 
  Send, 
  Shield, 
  Settings, 
  Zap,
  ChevronRight,
  LogOut,
  User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ activeSection, setActiveSection }) => {
  const { user, logout } = useAuth();
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: CreditCard },
    { id: 'payouts', label: 'Payouts', icon: Send },
    { id: 'fraud', label: 'Fraud Detection', icon: Shield },
    { id: 'api', label: 'API Settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="fixed left-0 top-0 h-full w-64 glass-surface border-r border-white/10">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">Solana PayAI</h1>
        </div>
        
        {/* User info */}
        <div className="mb-6 p-3 bg-white/5 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="overflow-hidden">
              <h3 className="text-white font-medium truncate">{user?.name}</h3>
              <p className="text-white/70 text-xs truncate">{user?.email}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs font-medium px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full">
              {user?.subscriptionTier || 'Free'}
            </span>
            <button 
              onClick={handleLogout}
              className="text-white/70 hover:text-white flex items-center text-xs"
            >
              <LogOut className="w-3 h-3 mr-1" />
              Logout
            </button>
          </div>
        </div>
        
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-white/10 text-white' 
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4" />}
              </button>
            );
          })}
        </nav>
      </div>
      
      <div className="absolute bottom-6 left-6 right-6">
        <div className="card p-4 text-center">
          <h3 className="text-white font-semibold mb-2">Upgrade to Pro</h3>
          <p className="text-white/70 text-sm mb-3">Get advanced AI features</p>
          <button 
            onClick={() => setActiveSection('api')}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
          >
            Upgrade Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
