import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../css/AssignmentsPage.css';

interface Tool { _id: string; name: string; serial_number: string; }

const UnitToolsPage = () => {
    const { unitName } = useParams<{ unitName: string }>();
    const { user } = useAuth();
    
    const [assignedTools, setAssignedTools] = useState<Tool[]>([]);
    const [unassignedTools, setUnassignedTools] = useState<Tool[]>([]);
    const [selectedTools, setSelectedTools] = useState<string[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(true);

    // ✨ ====================================================================
    // ✨ КЛЮЧОВЕ ВИПРАВЛЕННЯ: Спрощена та надійна логіка завантаження
    // ✨ ====================================================================
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Завжди завантажуємо закріплені засоби
                const assignedRes = await axios.get(`https://courseprojectmakar.onrender.com/api/units/${unitName}/tools`);
                setAssignedTools(assignedRes.data);

                // 2. Якщо режим додавання увімкнено, завантажуємо вільні засоби
                if (isAdding) {
                    const unassignedRes = await axios.get('https://courseprojectmakar.onrender.com/api/tools/unassigned');
                    setUnassignedTools(unassignedRes.data);
                }
            } catch (error:any) {
                console.error("Помилка завантаження даних:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [unitName, isAdding]); // ✨ 3. useEffect буде спрацьовувати при зміні unitName або isAdding

    const handleSelectTool = (toolId: string) => {
        setSelectedTools(prev => 
            prev.includes(toolId) 
                ? prev.filter(id => id !== toolId) 
                : [...prev, toolId]
        );
    };

    const handleAssign = async () => {
        if (selectedTools.length === 0) return;
        try {
            await axios.post('https://courseprojectmakar.onrender.com/api/tools/assign', { unitName, toolIds: selectedTools });
            setIsAdding(false);
            setSelectedTools([]);
            // Дані оновляться автоматично, оскільки isAdding зміниться, і useEffect спрацює знову
        } catch (error:any) {
            alert('Помилка закріплення.');
        }
    };

    return (
        <div className="assignments-page">
            <Link to="/assignments" className="back-link">← Всі підрозділи</Link>
            <h1>Засоби, закріплені за: <strong>{unitName}</strong></h1>

            <table className="assignments-table">
                <thead>
                    <tr>
                        <th>Назва засобу</th>
                        <th>Серійний номер</th>
                    </tr>
                </thead>
                <tbody>
                    {assignedTools.length > 0 ? (
                        assignedTools.map(tool => (
                            <tr key={tool._id}>
                                <td>{tool.name}</td>
                                <td>{tool.serial_number}</td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan={2}>За цим підрозділом не закріплено жодного засобу.</td></tr>
                    )}
                </tbody>
            </table>

            {user?.role === 'admin' && (
                <div className="add-tool-section">
                    <button onClick={() => setIsAdding(!isAdding)} className="toggle-add-button">
                        {isAdding ? 'Скасувати додавання' : 'Додати засіб зв\'язку'}
                    </button>

                    {isAdding && (
                        <div className="unassigned-container">
                            <h3>Оберіть вільні засоби для закріплення:</h3>
                            {loading ? <p>Пошук вільних засобів...</p> : (
                                unassignedTools.length > 0 ? (
                                    <div className="unassigned-list">
                                        {unassignedTools.map(tool => (
                                            <div key={tool._id} className="checkbox-item">
                                                <input type="checkbox" id={tool._id} onChange={() => handleSelectTool(tool._id)} />
                                                <label htmlFor={tool._id}>{tool.name} <span>({tool.serial_number})</span></label>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p>Вільних засобів для закріплення немає.</p>
                                )
                            )}
                            <button onClick={handleAssign} className="assign-button" disabled={selectedTools.length === 0}>
                                Закріпити обрані ({selectedTools.length})
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default UnitToolsPage;