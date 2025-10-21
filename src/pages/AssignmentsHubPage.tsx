import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../css/AssignmentsPage.css';

interface Unit { _id: string; name: string; }

const AssignmentsHubPage = () => {
    const [units, setUnits] = useState<Unit[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('https://courseprojectmakar.onrender.com/api/units')
            .then(res => setUnits(res.data))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p>Завантаження підрозділів...</p>;

    return (
        <div className="assignments-page">
            <h1>Закріплення за підрозділами</h1>
            <p>Оберіть підрозділ для перегляду та редагування закріплених засобів.</p>
            <div className="units-list">
                {units.map(unit => (
                    <Link key={unit._id} to={`/assignments/${unit.name}`} className="unit-card">
                        {unit.name}
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default AssignmentsHubPage;