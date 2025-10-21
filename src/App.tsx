import { useState, useEffect } from 'react'; // Додано useEffect
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom'; // Додано useLocation
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './components/LoginPage';
import DashboardPage from './pages/DashboardPage';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import ToolsPage from './pages/ToolsPage';
import ToolDetailsPage from './pages/ToolDetailsPage';
import './css/MainLayout.css';
import AddToolPage from './pages/AddToolPage';
import EditToolPage from './pages/EditToolPage';
import ProfilePage from './pages/ProfilePage';
import AssignmentsHubPage from './pages/AssignmentsHubPage';
import UnitToolsPage from './pages/UnitToolsPage';
import UserManagementPage from './pages/UserManagementPage';
import UnitManagementPage from './pages/UnitManagementPage';
import AnalyticsPage from './pages/AnalyticsPage';
import { FaBars, FaTimes } from 'react-icons/fa';

// Компонент-обгортка для захищених сторінок
const ProtectedLayout = () => {
    const { user, loading, logout } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation(); // ✨ Хук для відстеження зміни маршруту

    // ✨ Закриваємо сайдбар при переході на іншу сторінку
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location]);

    if (loading) { return <div>Перевірка авторизації...</div>; }
    if (!user) { return <Navigate to="/login" replace />; }

    return (
        // Додаємо клас layout--sidebar-open, якщо потрібно (для ефектів)
        <div className={`layout ${isSidebarOpen ? 'layout--sidebar-open' : ''}`}>
            <header className="header">
                <button
                    className="header__menu-button"
                    onClick={() => setIsSidebarOpen(true)} // Тільки відкриває
                    aria-label="Відкрити меню"
                >
                    <FaBars />
                </button>
                <div className="header__logo">
                    <img src="/logo.png" alt="Логотип" />
                    <span>Система обліку ТТД</span>
                </div>
                <div className="header__user-info">
                    <span>Вітаємо, {user?.fullName}!</span>
                    <button onClick={logout} className="header__logout-button">Вийти</button>
                </div>
            </header>

            <div className="layout__main-content">
    
                <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} /> {/* Передаємо стан як пропси */}

    {/* ✨ 2. Overlay залишається тут */}
    {isSidebarOpen && <div className="overlay" onClick={() => setIsSidebarOpen(false)}></div>}

    <main className="layout__page-content">
        <Outlet />
    </main>
</div>
            <Footer />
        </div>
    );
};
// Компонент-обгортка для адмінських сторінок (без змін)
const AdminRoute = ({ children }: { children: JSX.Element }) => {
    const { user } = useAuth();
    if (user?.role !== 'admin') {
        return <Navigate to="/" replace />;
    }
    return children;
};

// Функція App з маршрутами (без змін)
function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    
                    <Route element={<ProtectedLayout />}>
                        {/* Загальні маршрути */}
                        <Route path="/" element={<DashboardPage />} />
                        <Route path="/tools" element={<ToolsPage />} />
                        <Route path="/tools/:id" element={<ToolDetailsPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/assignments" element={<AssignmentsHubPage />} />
                        <Route path="/assignments/:unitName" element={<UnitToolsPage />} />
                        <Route path="/analytics" element={<AnalyticsPage />} />
                        
                        {/* Адмінські маршрути */}
                        <Route path="/admin/tools/add" element={ <AdminRoute><AddToolPage /></AdminRoute> } />
                        <Route path="/admin/tools/edit/:id" element={ <AdminRoute><EditToolPage /></AdminRoute> } />
                        <Route path="/admin/users" element={ <AdminRoute><UserManagementPage /></AdminRoute> } />
                        <Route path="/admin/units" element={ <AdminRoute><UnitManagementPage /></AdminRoute> } />
                    </Route>
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;