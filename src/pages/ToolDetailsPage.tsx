import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import '../css/ToolDetailsPage.css';

interface ToolDetails {
    _id: string;
    name: string;
    type: string;
    serial_number: string;
    status: string;
    assigned_to: string | null;
    specs: {
        frequency?: string;
        power?: string;
        channels?: number;
        weight_kg?: number;
    };
    last_update: string;
    photo_path?: string;
}

const ToolDetailsPage = () => {
    const { id } = useParams<{ id: string }>();
    const [tool, setTool] = useState<ToolDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchToolDetails = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:5000/api/tools/${id}`);
                setTool(response.data);
            } catch (err) {
                setError('Не вдалося завантажити дані.');
            } finally {
                setLoading(false);
            }
        };

        fetchToolDetails();
    }, [id]);

    if (loading) return <p>Завантаження даних про засіб...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;
    if (!tool) return <p>Інформацію про засіб не знайдено.</p>;

    const imageUrl = tool.photo_path 
        ? `http://localhost:5000${tool.photo_path}` 
        : '/images/placeholder.jpg';

    return (
        <div className="tool-details-page">
            <Link to="/tools" className="back-link">← Повернутися до списку</Link>
            <div className="details-card">
                <div className="details-card__image">
                    <img src={imageUrl} alt={tool.name} />
                </div>
                <div className="details-card__info">
                    {/* ✨ ========================================================== */}
                    {/* ✨ 1. ПОВЕРТАЄМО ВІДОБРАЖЕННЯ ВСІХ ДАНИХ                    */}
                    {/* ✨ ========================================================== */}
                    <h1>{tool.name}</h1>
                    <span className="status-badge" data-status={tool.status}>
                        {tool.status}
                    </span>

                    <div className="info-grid">
                        <div className="info-item">
                            <span>Тип</span>
                            <strong>{tool.type}</strong>
                        </div>
                        <div className="info-item">
                            <span>Серійний номер</span>
                            <strong>{tool.serial_number}</strong>
                        </div>
                        <div className="info-item">
                            <span>Закріплено за</span>
                            <strong>{tool.assigned_to || 'На складі'}</strong>
                        </div>
                        <div className="info-item">
                            <span>Останнє оновлення</span>
                            <strong>{new Date(tool.last_update).toLocaleString()}</strong>
                        </div>
                    </div>

                    <h2>Технічні характеристики</h2>
                    <div className="info-grid">
                        <div className="info-item">
                            <span>Діапазон частот</span>
                            <strong>{tool.specs.frequency || 'N/A'}</strong>
                        </div>
                        <div className="info-item">
                            <span>Потужність</span>
                            <strong>{tool.specs.power || 'N/A'}</strong>
                        </div>
                        <div className="info-item">
                            <span>Кількість каналів</span>
                            <strong>{tool.specs.channels || 'N/A'}</strong>
                        </div>
                         <div className="info-item">
                            <span>Вага (кг)</span>
                            <strong>{tool.specs.weight_kg || 'N/A'}</strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ToolDetailsPage;