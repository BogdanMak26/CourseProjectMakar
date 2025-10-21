import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams, Link } from 'react-router-dom';
import '../css/AddToolPage.css'; // Ми перевикористовуємо ці стилі

interface Unit { _id: string; name: string; }

const EditToolPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [units, setUnits] = useState<Unit[]>([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [photo, setPhoto] = useState<File | null>(null);
    const [currentPhotoPath, setCurrentPhotoPath] = useState('');

    const [formData, setFormData] = useState({
        name: '', type: '', serial_number: '', status: 'На складі', assigned_to: '',
        specs_frequency: '', specs_power: '', specs_channels: '', specs_weight_kg: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const unitsRes = await axios.get('https://courseprojectmakar.onrender.com/api/units');
                setUnits(unitsRes.data);

                const toolRes = await axios.get(`https://courseprojectmakar.onrender.com/api/tools/${id}`);
                const toolData = toolRes.data;
                
                setFormData({
                    name: toolData.name || '',
                    type: toolData.type || '',
                    serial_number: toolData.serial_number || '',
                    status: toolData.status || 'На складі',
                    assigned_to: toolData.assigned_to || '',
                    specs_frequency: toolData.specs?.frequency || '',
                    specs_power: toolData.specs?.power || '',
                    specs_channels: toolData.specs?.channels?.toString() || '',
                    specs_weight_kg: toolData.specs?.weight_kg?.toString() || ''
                });
                setCurrentPhotoPath(toolData.photo_path || '');
                setLoading(false);
            } catch (err) {
                setError('Не вдалося завантажити дані для редагування.');
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) { setPhoto(e.target.files[0]); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const data = new FormData();
        
        Object.keys(formData).forEach(key => {
            if (!key.startsWith('specs_')) {
                data.append(key, (formData as any)[key]);
            }
        });

        const specs = {
            frequency: formData.specs_frequency,
            power: formData.specs_power,
            channels: Number(formData.specs_channels),
            weight_kg: Number(formData.specs_weight_kg)
        };
        data.append('specs', JSON.stringify(specs));

        if (photo) { data.append('photo', photo); }

        try {
            await axios.put(`https://courseprojectmakar.onrender.com/api/tools/${id}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Дані успішно оновлено!');
            navigate(`/tools/${id}`);
        } catch (err) {
            setError('Помилка при оновленні даних.');
        }
    };

    if (loading) return <p>Завантаження форми редагування...</p>;

    return (
        <div className="add-tool-page">
            <Link to={`/tools/${id}`} className="back-link">← Повернутися до огляду</Link>
            <h1>Редагування засобу зв'язку</h1>
            
            {/* ✨ ========================================================== */}
            {/* ✨ ОСЬ ВІДСУТНЯ ЧАСТИНА КОДУ, ЯКУ МИ ПОВЕРТАЄМО              */}
            {/* ✨ ========================================================== */}
            <form onSubmit={handleSubmit} className="add-tool-form">
                <div className="form-section">
                    <h3>Основна інформація</h3>
                    <div className="form-grid">
                        <input name="name" placeholder="Назва" value={formData.name} onChange={handleChange} required />
                        <input name="type" placeholder="Тип" value={formData.type} onChange={handleChange} required />
                        <input name="serial_number" placeholder="Серійний номер" value={formData.serial_number} onChange={handleChange} required />
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
                        <input name="specs_frequency" placeholder="Діапазон частот" value={formData.specs_frequency} onChange={handleChange} />
                        <input name="specs_power" placeholder="Потужність" value={formData.specs_power} onChange={handleChange} />
                        <input name="specs_channels" type="number" placeholder="Кількість каналів" value={formData.specs_channels} onChange={handleChange} />
                        <input name="specs_weight_kg" type="number" step="0.01" placeholder="Вага (кг)" value={formData.specs_weight_kg} onChange={handleChange} />
                    </div>
                </div>

                <div className="form-section">
                    <h3>Фотографія</h3>
                    {currentPhotoPath && <img src={`https://courseprojectmakar.onrender.com${currentPhotoPath}`} alt="Поточне фото" className="current-photo" />}
                    <p>Завантажте нове фото, щоб замінити поточне:</p>
                    <input type="file" name="photo" onChange={handleFileChange} />
                </div>
                
                {error && <p className="error-message">{error}</p>}

                <button type="submit" className="submit-button">Зберегти зміни</button>
            </form>
        </div>
    );
};

export default EditToolPage;