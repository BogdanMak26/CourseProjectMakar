import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../css/ProfilePage.css'; // Створимо цей файл зараз

// Описуємо повну структуру даних користувача
interface UserProfile {
    _id: string;
    full_name: string;
    rank: string;
    position: string;
    unit: string;
    login: string;
    role: 'admin' | 'operator';
}

const ProfilePage = () => {
    const { user } = useAuth(); // Беремо базові дані з контексту
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    
    // Стан для форми зміни пароля
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            if (user) {
                try {
                    const response = await axios.post('http://localhost:5000/api/me', { login: user.login });
                    setProfile(response.data);
                } catch (err) {
                    console.error("Не вдалося завантажити профіль", err);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchProfile();
    }, [user]);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        try {
            const response = await axios.put('http://localhost:5000/api/me/password', {
                login: user?.login,
                oldPassword,
                newPassword
            });
            setMessage(response.data.message);
            setOldPassword('');
            setNewPassword('');
        } catch (err: any) {
            setMessage(err.response?.data?.message || 'Помилка зміни пароля.');
        }
    };

    if (loading) return <p>Завантаження профілю...</p>;
    if (!profile) return <p>Не вдалося завантажити дані профілю.</p>;

    return (
        <div className="profile-page">
            <h1>Особистий кабінет</h1>
            <div className="profile-grid">
                {/* Картка з особистою інформацією */}
                <div className="profile-card">
                    <h2>Особисті дані</h2>
                    <div className="info-grid">
                        <div className="info-item"><span>ПІБ</span><strong>{profile.full_name}</strong></div>
                        <div className="info-item"><span>Звання</span><strong>{profile.rank}</strong></div>
                        <div className="info-item"><span>Посада</span><strong>{profile.position}</strong></div>
                        <div className="info-item"><span>Підрозділ</span><strong>{profile.unit}</strong></div>
                    </div>
                </div>

                {/* Картка з даними акаунту та зміною пароля */}
                <div className="profile-card">
                    <h2>Дані акаунту</h2>
                    <div className="info-grid">
                        <div className="info-item"><span>Логін</span><strong>{profile.login}</strong></div>
                        <div className="info-item"><span>Роль</span><strong>{profile.role}</strong></div>
                    </div>

                    <hr />

                    <h2>Зміна пароля</h2>
                    <form onSubmit={handlePasswordChange} className="password-form">
                        <input 
                            type="password" 
                            placeholder="Старий пароль" 
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            required 
                        />
                        <input 
                            type="password" 
                            placeholder="Новий пароль"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required 
                        />
                        <button type="submit">Змінити пароль</button>
                        {message && <p className="form-message">{message}</p>}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;