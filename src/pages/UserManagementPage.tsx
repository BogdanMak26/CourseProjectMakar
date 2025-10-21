import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/UserManagementPage.css'; // Створимо цей файл зараз
import { FaEdit, FaTrash, FaPlus, FaSave, FaTimes } from 'react-icons/fa';
import ConfirmModal from '../components/ConfirmModal';

interface User {
    _id: string;
    login: string;
    role: 'admin' | 'operator';
    full_name?: string;
    rank?: string;
    position?: string;
    unit?: string;
}
interface Unit { _id: string; name: string; }

const UserManagementPage = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [units, setUnits] = useState<Unit[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userToDeleteId, setUserToDeleteId] = useState<string | null>(null);
    
    // Стан для форми (додавання/редагування)
    const [isEditing, setIsEditing] = useState<string | null>(null); // null - додавання, string - ID для редагування
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState<Partial<User>>({});
    const [password, setPassword] = useState(''); // Окремий стан для пароля при створенні

    const fetchData = async () => {
        setLoading(true);
        try {
            // ✨ 2. Завантажуємо і користувачів, і підрозділи
            const [usersRes, unitsRes] = await Promise.all([
                axios.get('https://courseprojectmakar.onrender.com/api/soldiers'),
                axios.get('https://courseprojectmakar.onrender.com/api/units')
            ]);
            setUsers(usersRes.data);
            setUnits(unitsRes.data);
            setError('');
        } catch (err) {
            setError('Не вдалося завантажити дані.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddClick = () => {
       setFormData({ role: 'operator' }); 
    setPassword('');
    setIsEditing(null);
    setShowForm(true);
    setError('');
    };

    const handleEditClick = (user: User) => {
        setFormData(user); // Заповнюємо форму даними користувача
        setIsEditing(user._id); // Режим редагування
        setShowForm(true);
        setError('');
    };

    const handleDeleteClick = (id: string) => {
        setUserToDeleteId(id); // Зберігаємо ID користувача, якого хочемо видалити
        setIsModalOpen(true); // Відкриваємо модальне вікно
    };

    // ✨ 4. Створюємо функцію для підтвердження видалення
    const confirmDelete = async () => {
        if (userToDeleteId) {
            try {
                setError(''); // Скидаємо попередню помилку
                await axios.delete(`https://courseprojectmakar.onrender.com/api/soldiers/${userToDeleteId}`);
                fetchData(); // Оновлюємо список
            } catch (err) {
                setError('Помилка видалення користувача.');
            } finally {
                setIsModalOpen(false); // Закриваємо вікно
                setUserToDeleteId(null); // Скидаємо ID
            }
        }
    };
    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            if (isEditing) { // Редагування існуючого
                await axios.put(`https://courseprojectmakar.onrender.com/api/soldiers/${isEditing}`, formData);
            } else { // Створення нового
                await axios.post('https://courseprojectmakar.onrender.com/api/soldiers', { ...formData, password });
            }
            setShowForm(false);
            fetchData(); // Оновлюємо список
        } catch (err: any) {
            setError(err.response?.data?.message || 'Помилка збереження.');
        }
    };

    if (loading) return <p>Завантаження користувачів...</p>;

    return (
        <div className="user-management-page">
            <header className="page-header">
                <h1>Керування користувачами</h1>
                <button onClick={handleAddClick} className="add-button">
                    <FaPlus /> Додати користувача
                </button>
            </header>

            {error && <p className="error-message">{error}</p>}

            {/* --- Форма додавання/редагування --- */}
            {showForm && (
                <div className="form-container">
                    <h2>{isEditing ? 'Редагування користувача' : 'Додавання нового користувача'}</h2>
                    <form onSubmit={handleFormSubmit}>
                        <input name="login" value={formData.login || ''} onChange={handleInputChange} placeholder="Логін" required />
                        {/* Пароль показуємо тільки при створенні */}
                        {!isEditing && (
                             <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Пароль" required />
                        )}
                        <select name="role" value={formData.role || 'operator'} onChange={handleInputChange} required>
                            <option value="operator">Оператор</option>
                            <option value="admin">Адміністратор</option>
                        </select>
                        <input name="full_name" value={formData.full_name || ''} onChange={handleInputChange} placeholder="ПІБ" />
                        <input name="rank" value={formData.rank || ''} onChange={handleInputChange} placeholder="Звання" />
                        <input name="position" value={formData.position || ''} onChange={handleInputChange} placeholder="Посада" />
                        <select name="unit" value={formData.unit || ''} onChange={handleInputChange}>
                            <option value="">-- Не призначено --</option>
                            {units.map(unit => (
                                <option key={unit._id} value={unit.name}>{unit.name}</option>
                            ))}
                        </select>
                        <div className="form-buttons">
                            <button type="submit" className="save-button"><FaSave /> Зберегти</button>
                            <button type="button" onClick={() => setShowForm(false)} className="cancel-button"><FaTimes /> Скасувати</button>
                        </div>
                    </form>
                </div>
            )}

            {/* --- Таблиця користувачів --- */}
            <table className="users-table">
                <thead>
                    <tr>
                        <th>Логін</th>
                        <th>Роль</th>
                        <th>ПІБ</th>
                        <th>Звання</th>
                        <th>Посада</th>
                        <th>Підрозділ</th>
                        <th>Дії</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user._id}>
                           <td data-label="Логін">{user.login}</td>
            <td data-label="Роль">{user.role}</td>
            <td data-label="ПІБ">{user.full_name || '—'}</td>
            <td data-label="Звання">{user.rank || '—'}</td>
            <td data-label="Посада">{user.position || '—'}</td>
            <td data-label="Підрозділ">{user.unit || '—'}</td>
            <td className="actions">
                                <button onClick={() => handleEditClick(user)} title="Редагувати"><FaEdit /></button>
                                <button onClick={() => handleDeleteClick(user._id)} title="Видалити" className="delete"><FaTrash /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <ConfirmModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={confirmDelete}
                title="Підтвердження видалення"
                message="Ви впевнені, що хочете видалити цього користувача?"
            />
        </div>
    );
};

export default UserManagementPage;