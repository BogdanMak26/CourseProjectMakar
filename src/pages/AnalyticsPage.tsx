import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
} from 'chart.js';
import '../css/AnalyticsPage.css';

ChartJS.register( CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend );

// Дозволяємо unitName бути null
interface UnitStat {
    unitName: string | null;
    count: number;
}

const AnalyticsPage = () => {
    const [chartData, setChartData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true); // Починаємо завантаження тут
            setError(''); // Скидаємо помилку
            try {
                const response = await axios.get('https://courseprojectmakar.onrender.com/api/analytics/tools-by-unit');
                let stats: UnitStat[] = response.data;

                // ✨ 1. ФІЛЬТРУЄМО ЗАПИСИ З unitName: null ✨
                stats = stats.filter(stat => stat.unitName !== null);

                // ✨ 2. СОРТУЄМО ТІЛЬКИ ВІДФІЛЬТРОВАНІ ДАНІ ✨
                stats = stats.sort((a, b) => (a.unitName || '').localeCompare(b.unitName || ''));

                // Готуємо дані для Chart.js, тільки якщо є що показувати
                if (stats.length > 0) {
                    const data = {
                        labels: stats.map(stat => stat.unitName), // null вже не буде
                        datasets: [
                            {
                                label: 'Кількість засобів зв\'язку',
                                data: stats.map(stat => stat.count),
                                backgroundColor: 'rgba(0, 43, 92, 0.6)',
                                borderColor: 'rgba(0, 43, 92, 1)',
                                borderWidth: 1,
                            },
                        ],
                    };
                    setChartData(data);
                } else {
                    setChartData(null); // Якщо після фільтрації нічого не лишилось
                }

            } catch (err:any) {
                console.error("Помилка завантаження/обробки даних:", err); // Додаємо лог
                setError('Не вдалося завантажити дані для аналізу.');
            } finally {
                setLoading(false); // Завершуємо завантаження в будь-якому випадку
            }
        };
        fetchData();
    }, []); // Залежності залишаємо порожніми

    const options = { // Налаштування вигляду діаграми
        responsive: true,
        plugins: { /* ... */ },
        scales: { /* ... */ }
    };

    if (loading) return <p>Завантаження аналітики...</p>;
    // Показуємо помилку ТІЛЬКИ якщо вона є і немає даних
    if (error && !chartData) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div className="analytics-page">
            <h1>Аналіз використання</h1>
            <div className="chart-container">
                {chartData ? <Bar options={options} data={chartData} /> : <p>Немає даних про закріплені засоби для відображення діаграми.</p>}
            </div>
        </div>
    );
};

export default AnalyticsPage;