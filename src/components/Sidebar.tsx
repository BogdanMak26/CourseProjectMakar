import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaTimes } from 'react-icons/fa'; // Імпортуємо іконку
import '../css/MainLayout.css'; // Переконайтесь, що стилі підключено

// ✨ 1. Додаємо пропси для стану та закриття
interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
    const { user } = useAuth();

    return (
        // ✨ 2. Застосовуємо клас 'open' та використовуємо onClose
        <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
            {/* ✨ 3. Кнопка закриття тепер всередині цього компонента */}
            <button
                className="sidebar__close-button"
                onClick={onClose}
                aria-label="Закрити меню"
            >
                <FaTimes />
            </button>
            <nav className="sidebar__nav">
                <NavLink to="/" end className={({ isActive }) => isActive ? "sidebar__link active" : "sidebar__link"}>Основна</NavLink>
                <NavLink to="/tools" className={({ isActive }) => isActive ? "sidebar__link active" : "sidebar__link"}>Огляд засобів</NavLink>
                <NavLink to="/profile" className={({ isActive }) => isActive ? "sidebar__link active" : "sidebar__link"}>Особистий кабінет</NavLink>
                <NavLink to="/assignments" className={({ isActive }) => isActive ? "sidebar__link active" : "sidebar__link"}>Закріплення</NavLink>
                <NavLink to="/analytics" className={({ isActive }) => isActive ? "sidebar__link active" : "sidebar__link"}>Аналіз використання</NavLink>

                {user?.role === 'admin' && (
                    <div className="sidebar__admin-panel">
                        <hr />
                        <span className="sidebar__admin-title">Панель адміна</span>
                        <NavLink to="/admin/users" className={({ isActive }) => isActive ? "sidebar__link active" : "sidebar__link"}>Редагування Користувачів</NavLink>
                        <NavLink to="/admin/units" className={({ isActive }) => isActive ? "sidebar__link active" : "sidebar__link"}>Керування Підрозділами</NavLink>
                   
                    </div>
                )}
            </nav>
        </aside>
    );
};

export default Sidebar;