import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import '../css/ToolsPage.css';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

interface Tool {
    _id: string;
    name: string;
    type: string;
    serial_number: string;
    status: string;
    assigned_to: string | null;
}

const ToolsPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [tools, setTools] = useState<Tool[]>([]);
    const [filteredTools, setFilteredTools] = useState<Tool[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        const fetchTools = async () => {
            try {
                setLoading(true);
                const response = await axios.get('https://courseprojectmakar.onrender.com/api/tools');
                setTools(response.data);
                setFilteredTools(response.data);
            } catch (err:any) {
                setError('Не вдалося завантажити дані про засоби зв\'язку.');
            } finally {
                setLoading(false);
            }
        };

        fetchTools();
    }, []);

    useEffect(() => {
        let result = tools;
        if (statusFilter !== 'all') {
            result = result.filter(tool => tool.status === statusFilter);
        }
        if (searchTerm) {
            result = result.filter(tool =>
                tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                tool.serial_number.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        setFilteredTools(result);
    }, [searchTerm, statusFilter, tools]);

    
    const handleRowClick = (id: string, target: EventTarget) => {
        if ((target as HTMLElement).closest('.tools-table__actions')) {
            return; // Якщо клік був на кнопках, нічого не робимо
        }
        navigate(`/tools/${id}`);
    };

    if (loading) return <p>Завантаження...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div className="tools-page">
            <header className="tools-page__header">
                <h1>Огляд засобів зв'язку</h1>
                {user?.role === 'admin' && (
                    <Link to="/admin/tools/add" className="tools-page__add-button">
                        <FaPlus /> Додати новий засіб
                    </Link>
                )}
            </header>

            <div className="tools-page__controls">
                <input
                    type="text"
                    placeholder="Пошук за назвою або серійним номером..."
                    className="tools-page__search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                    className="tools-page__filter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="all">Всі статуси</option>
                    <option value="На складі">На складі</option>
                    <option value="На завданні">На завданні</option>
                    <option value="В ремонті">В ремонті</option>
                </select>
            </div>

            <table className="tools-table">
                <thead>
                    <tr>
                        <th>Назва</th>
                        <th>Тип</th>
                        <th>Серійний номер</th>
                        <th>Статус</th>
                        <th>Закріплено за</th>
                        {user?.role === 'admin' && <th>Дії</th>}
                    </tr>
                </thead>
                <tbody>
                    {filteredTools.map(tool => (
                        <tr key={tool._id} onClick={(e) => handleRowClick(tool._id, e.target)} className="clickable-row">
                            <td>{tool.name}</td>
                            <td>{tool.type}</td>
                            <td>{tool.serial_number}</td>
                            <td>
                                <span className="status-badge" data-status={tool.status}>
                                    {tool.status}
                                </span>
                            </td>
                            <td>{tool.assigned_to || '—'}</td>
                            {user?.role === 'admin' && (
                                <td className="tools-table__actions">
                                    {/* ✨ 2. ВИПРАВЛЯЄМО ШЛЯХ НА ПРАВИЛЬНИЙ */}
                                    <Link to={`/tools/edit/${tool._id}`} title="Редагувати">
                                        <FaEdit />
                                    </Link>
                                    <button title="Видалити" className="delete"><FaTrash /></button>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ToolsPage;