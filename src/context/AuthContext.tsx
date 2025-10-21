import React, { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';

// Тип для даних користувача
interface User {
    login: string;
    fullName: string;
    role: 'admin' | 'operator';
}

// Тип для контексту
interface AuthContextType {
    user: User | null;
    loading: boolean; // Додаємо стан завантаження
    login: (userData: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true); // Початково завантажуємо

    // ✨ 1. Перевіряємо localStorage при першому завантаженні
    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                setUser(JSON.parse(storedUser)); // Відновлюємо користувача зі сховища
            }
        } catch (error) {
            console.error("Помилка читання localStorage:", error);
            localStorage.removeItem('user'); // Очищуємо, якщо дані пошкоджені
        } finally {
            setLoading(false); // Завершуємо завантаження
        }
    }, []); // Пустий масив залежностей - виконується один раз

    // ✨ 2. Зберігаємо в localStorage при вході
    const login = (userData: User) => {
        try {
            localStorage.setItem('user', JSON.stringify(userData)); // Зберігаємо як рядок JSON
            setUser(userData);
        } catch (error) {
            console.error("Помилка запису в localStorage:", error);
        }
    };

    // ✨ 3. Видаляємо з localStorage при виході
    const logout = () => {
        try {
            localStorage.removeItem('user'); // Видаляємо дані
            setUser(null);
        } catch (error) {
            console.error("Помилка видалення з localStorage:", error);
        }
    };

    // Передаємо loading у value, щоб ProtectedRoute міг почекати
    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Хук useAuth залишається без змін
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};