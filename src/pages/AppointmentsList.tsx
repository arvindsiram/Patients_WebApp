import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Dashboard } from '@/components/Dashboard';

const AppointmentsList = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <Dashboard 
      onLogout={handleLogout} 
      onBack={handleBackToDashboard}
      showBackButton={true}
    />
  );
};

export default AppointmentsList;
