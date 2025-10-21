import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../css/AddToolPage.css'; // Створимо цей файл зараз

interface Unit { _id: string; name: string; }

const AddToolPage = () => {
    const navigate = useNavigate();
    const [units, setUnits] = useState<Unit[]>([]);
    const [error, setError] = useState('');

    // Стан для полів форми
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        serial_number: '',
        status: 'На складі',
        assigned_to: '',
        specs_frequency: '',
        specs_power: '',
        specs_channels: '',
        specs_weight_kg: ''
    });
    const [photo, setPhoto] = useState<File | null>(null);

    // Завантажуємо список підрозділів
    useEffect(() => {
        axios.get('https://courseprojectmakar.onrender.com/api/units')
            .then(res => setUnits(res.data))
            .catch(() => setError('Не вдалося завантажити список підрозділів.'));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setPhoto(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const data = new FormData();
        // Додаємо всі текстові поля
        data.append('name', formData.name);
        data.append('type', formData.type);
        data.append('serial_number', formData.serial_number);
        data.append('status', formData.status);
        data.append('assigned_to', formData.assigned_to);
        
        // Збираємо ТТХ в один об'єкт і перетворюємо в рядок JSON
        const specs = {
            frequency: formData.specs_frequency,
            power: formData.specs_power,
            channels: Number(formData.specs_channels),
            weight_kg: Number(formData.specs_weight_kg)
        };
        data.append('specs', JSON.stringify(specs));

        // Додаємо файл, якщо він обраний
        if (photo) {
            data.append('photo', photo);
        }

        try {
            await axios.post('https://courseprojectmakar.onrender.com/api/tools', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Засіб успішно додано!');
            navigate('/tools'); // Повертаємось на сторінку огляду
        } catch (err:any) {
            setError('Помилка при додаванні засобу. Перевірте дані.');
        }
    };

    return (
        <div className="add-tool-page">
            <h1>Додавання нового засобу зв'язку</h1>
            <form onSubmit={handleSubmit} className="add-tool-form">
                <div className="form-section">
                    <h3>Основна інформація</h3>
                    <div className="form-grid">
                        <input name="name" placeholder="Назва (напр., Motorola DP4801e)" onChange={handleChange} required />
                        <input name="type" placeholder="Тип (напр., Портативна)" onChange={handleChange} required />
                        <input name="serial_number" placeholder="Серійний номер" onChange={handleChange} required />
                        <select name="status" value={formData.status} onChange={handleChange}>
                            <option>На складі</option>
                            <option>На завданні</option>
                            <option>В ремонті</option>
                        </select>
                        <select name="assigned_to" value={formData.assigned_to} onChange={handleChange}>
                            <option value="">Не закріплено</option>
                            {units.map(unit => <option key={unit._id} value={unit.name}>{unit.name}</option>)}
                        </select>
                    </div>
                </div>

                <div className="form-section">
                    <h3>Технічні характеристики</h3>
                     <div className="form-grid">
                        <input name="specs_frequency" placeholder="Діапазон частот (напр., 136-174 MHz)" onChange={handleChange} />
                        <input name="specs_power" placeholder="Потужність (напр., 5W)" onChange={handleChange} />
                        <input name="specs_channels" type="number" placeholder="Кількість каналів" onChange={handleChange} />
                        <input name="specs_weight_kg" type="number" step="0.1" placeholder="Вага (кг)" onChange={handleChange} />
                    </div>
                </div>

                <div className="form-section">
                    <h3>Фотографія</h3>
                    <input type="file" name="photo" onChange={handleFileChange} />
                </div>
                
                {error && <p className="error-message">{error}</p>}

                <button type="submit" className="submit-button">Додати засіб</button>
            </form>
        </div>
    );
};

export default AddToolPage;