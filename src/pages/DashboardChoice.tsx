import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarPlus, List, LogOut, Heart } from 'lucide-react';

const DashboardChoice = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg">HealthCare Portal</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {user?.email}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-2">Welcome to Your Health Portal</h1>
          <p className="text-muted-foreground">
            What would you like to do today?
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Book Appointment Card */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => navigate('/book-appointment')}>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <CalendarPlus className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-xl">Book New Appointment</CardTitle>
              <CardDescription>
                Schedule a new appointment with our healthcare professionals
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button className="w-full">
                Book Appointment
              </Button>
            </CardContent>
          </Card>

          {/* View Appointments Card */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => navigate('/appointments')}>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-4 rounded-full bg-secondary/50 group-hover:bg-secondary/70 transition-colors">
                <List className="h-10 w-10 text-secondary-foreground" />
              </div>
              <CardTitle className="text-xl">View Appointments</CardTitle>
              <CardDescription>
                Check your scheduled, completed, and cancelled appointments
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button variant="secondary" className="w-full">
                View List
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default DashboardChoice;
