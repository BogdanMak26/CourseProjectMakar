import React, { useState, useEffect } from 'react';
import $ from 'jquery';
import '../css/LoginPage.css'; 
import { FaUserAlt, FaLock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom'; // 1. Імпортуємо useNavigate
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const LoginPage = () => {
    const navigate = useNavigate(); // 3. Ініціалізуємо хук для навігації
    const { login: authLogin } = useAuth(); // 4. Отримуємо функцію login з контексту
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        // ...перевірка на порожні поля...

        try {
            const response = await axios.post('http://localhost:5000/api/login', {
                login,
                password
            });
            
            // 5. Зберігаємо дані користувача в контекст і переходимо на головну
            authLogin(response.data); 
            navigate('/'); // Перенаправляємо на головну сторінку

        } catch (err: any) {
            setError(err.response?.data?.message || 'Сталася помилка');
        }
    };
    

    return (
        <div className="login-page">
            <header className="login-page__header">
                <img src="/logo.png" alt="Логотип ВІТІ" className="login-page__logo" />
                <div className="login-page__header-text">
                    <h1>Система обліку ТТД</h1>
                    <p>Військовий інститут телекомунікацій та інформатизації</p>
                </div>
            </header>
            <main className="login-page__main">
                <form className="login-page__form" onSubmit={handleSubmit} noValidate>
                    <h2 className="login-page__title">Авторизація</h2>
                    <div className="login-page__group">
                        <label htmlFor="login" className="login-page__label">Логін</label>
                        <div className="login-page__input-wrapper">
                            <FaUserAlt className="login-page__icon" />
                            <input
                                type="text"
                                id="login"
                                className="login-page__input"
                                value={login}
                                onChange={(e) => setLogin(e.target.value)}
                                placeholder="Введіть ваш логін"
                                required
                            />
                        </div>
                    </div>
                    <div className="login-page__group">
                        <label htmlFor="password" className="login-page__label">Пароль</label>
                        <div className="login-page__input-wrapper">
                            <FaLock className="login-page__icon" />
                            <input
                                type="password"
                                id="password"
                                className="login-page__input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Введіть ваш пароль"
                                required
                            />
                        </div>
                    </div>
                    {error && <p className="login-page__error">{error}</p>}
                    <button type="submit" className="login-page__button">
                        Увійти в систему
                    </button>
                </form>
            </main>
            <footer className="login-page__footer">
                <p>&copy; 2025 ВІТІ ім. Героїв Крут. Всі права захищено.</p>
            </footer>
        </div>
    );
};

export default LoginPage;