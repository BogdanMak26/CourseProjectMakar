import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/UnitManagementPage.css'; // Створимо цей файл зараз
import { FaTrash, FaPlus, FaSave, FaTimes } from 'react-icons/fa';

interface Unit { _id: string; name: string; }

const UnitManagementPage = () => {
    const [units, setUnits] = useState<Unit[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [newUnitName, setNewUnitName] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const fetchUnits = async () => {
        setLoading(true);
        try {
            const response = await axios.get('https://courseprojectmakar.onrender.com/api/units');
            setUnits(response.data);
            setError('');
        } catch (err:any) {
            setError('Не вдалося завантажити список підрозділів.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUnits();
    }, []);

    const handleAddUnit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!newUnitName.trim()) {
            setError('Назва підрозділу не може бути порожньою.');
            return;
        }
        try {
            await axios.post('https://courseprojectmakar.onrender.com/api/units', { name: newUnitName });
            setNewUnitName(''); // Очищуємо поле
            setIsAdding(false); // Ховаємо форму
            fetchUnits(); // Оновлюємо список
        } catch (err: any) {
            setError(err.response?.data?.message || 'Помилка додавання підрозділу.');
        }
    };

    const handleDeleteUnit = async (id: string) => {
        if (window.confirm('Ви впевнені, що хочете видалити цей підрозділ? Це може вплинути на закріплені засоби та користувачів.')) {
            try {
                await axios.delete(`https://courseprojectmakar.onrender.com/api/units/${id}`);
                fetchUnits(); // Оновлюємо список
            } catch (err: any) {
                 setError(err.response?.data?.message || 'Помилка видалення підрозділу.');
            }
        }
    };

    if (loading) return <p>Завантаження підрозділів...</p>;

    return (
        <div className="unit-management-page">
            <header className="page-header">
                <h1>Керування Підрозділами</h1>
                <button onClick={() => setIsAdding(!isAdding)} className="add-button">
                    {isAdding ? <><FaTimes /> Скасувати</> : <><FaPlus /> Додати підрозділ</>}
                </button>
            </header>

            {error && <p className="error-message">{error}</p>}

            {/* --- Форма додавання --- */}
            {isAdding && (
                 <form onSubmit={handleAddUnit} className="add-unit-form">
                     <input
                         type="text"
                         value={newUnitName}
                         onChange={(e) => setNewUnitName(e.target.value)}
                         placeholder="Назва нового підрозділу"
                         required
                     />
                     <button type="submit" className="save-button"><FaSave /> Зберегти</button>
                 </form>
            )}

            {/* --- Список підрозділів --- */}
            <ul className="units-list-manage">
                {units.map(unit => (
                    <li key={unit._id}>
                        <span>{unit.name}</span>
                        <button onClick={() => handleDeleteUnit(unit._id)} title="Видалити" className="delete-button">
                            <FaTrash />
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default UnitManagementPage;