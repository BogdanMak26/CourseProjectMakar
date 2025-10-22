// src/components/Header.tsx
import { useAuth } from '../context/AuthContext';
import '../css/MainLayout.css'; // Підключаємо спільні стилі

const Header = () => {
    const { user, logout } = useAuth();

    return (
        <header className="header">
            <div className="header__logo">
                <img src="/logo.png" alt="Логотип" />
                <span>Система обліку засобів зв'язку</span>
            </div>
            <div className="header__user-info">
                <span>Вітаємо, {user?.fullName}!</span>
                <button onClick={logout} className="header__logout-button">Вийти</button>
            </div>
        </header>
    );
};

export default Header;