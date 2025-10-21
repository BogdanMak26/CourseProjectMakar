require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

// Імпортуємо моделі
const Soldier = require('./models/Soldier');
const Tool = require('./models/Tool');
const Unit = mongoose.model('Unit', new mongoose.Schema({ name: String }), 'units');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Налаштування Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) { cb(null, 'uploads/'); },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + path.extname(file.originalname);
        const serial = req.body.serial_number || 'file';
        cb(null, serial + '-' + uniqueSuffix);
    }
});
const upload = multer({ storage: storage });

// Підключення до MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB підключено успішно!'))
    .catch(err => console.error('❌ Помилка підключення до MongoDB:', err));

// --- API Маршрути ---

// Маршрути для користувачів (soldier)
app.post('/api/login', async (req, res) => {
    const { login, password } = req.body;
    try {
        const soldier = await Soldier.findOne({ login });
        if (!soldier) return res.status(404).json({ message: 'Користувача не знайдено' });
        if (soldier.password !== password) return res.status(400).json({ message: 'Неправильний пароль' });
        res.status(200).json({ login: soldier.login, role: soldier.role, fullName: soldier.full_name });
    } catch (error) {
        console.error("Помилка логіну:", error);
        res.status(500).json({ message: 'Помилка на сервері' });
    }
});

app.post('/api/me', async (req, res) => {
    try {
        const soldier = await Soldier.findOne({ login: req.body.login }).select('-password');
        if (!soldier) return res.status(404).json({ message: 'Користувача не знайдено' });
        res.json(soldier);
    } catch (error) {
        console.error("Помилка отримання профілю:", error);
        res.status(500).json({ message: 'Помилка на сервері' });
    }
});

app.put('/api/me/password', async (req, res) => {
    const { login, oldPassword, newPassword } = req.body;
    try {
        const soldier = await Soldier.findOne({ login });
        if (!soldier) return res.status(404).json({ message: 'Користувача не знайдено' });
        if (soldier.password !== oldPassword) return res.status(400).json({ message: 'Неправильний старий пароль' });
        soldier.password = newPassword;
        await soldier.save();
        res.json({ message: 'Пароль успішно оновлено!' });
    } catch (error) {
        console.error("Помилка зміни пароля:", error);
        res.status(500).json({ message: 'Помилка на сервері' });
    }
});

// Маршрути для засобів (tool)
app.get('/api/tools', async (req, res) => {
    try {
        const tools = await Tool.find();
        res.json(tools);
    } catch (error) {
        console.error("Помилка отримання всіх засобів:", error);
        res.status(500).json({ message: 'Помилка на сервері' });
    }
});

app.get('/api/tools/unassigned', async (req, res) => {
    try {
        const tools = await Tool.find({ $or: [{ assigned_to: null }, { assigned_to: "" }] });
        res.json(tools);
    } catch (error) {
        console.error("Помилка отримання вільних засобів:", error);
        res.status(500).json({ message: 'Помилка на сервері' });
    }
});

app.get('/api/tools/:id', async (req, res) => {
    try {
        const tool = await Tool.findById(req.params.id);
        if (!tool) return res.status(404).json({ message: 'Засіб не знайдено' });
        res.json(tool);
    } catch (error) {
        console.error("Помилка отримання засобу за ID:", error);
        res.status(500).json({ message: 'Помилка на сервері' });
    }
});

app.post('/api/tools', upload.single('photo'), async (req, res) => {
    try {
        const { name, type, serial_number, status, assigned_to, specs } = req.body;
        const newTool = new Tool({
            name, type, serial_number, status,
            assigned_to: assigned_to || null,
            specs: JSON.parse(specs),
            last_update: new Date(),
            photo_path: req.file ? `/uploads/${req.file.filename}` : null
        });
        await newTool.save();
        res.status(201).json(newTool);
    } catch (error) {
        console.error("Помилка створення засобу:", error);
        res.status(500).json({ message: 'Помилка створення засобу' });
    }
});

app.put('/api/tools/:id', upload.single('photo'), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, type, serial_number, status, assigned_to, specs } = req.body;
        const updateData = {
            name, type, serial_number, status,
            assigned_to: assigned_to || null,
            specs: JSON.parse(specs),
            last_update: new Date(),
        };
        if (req.file) {
            updateData.photo_path = `/uploads/${req.file.filename}`;
        }
        const updatedTool = await Tool.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedTool) return res.status(404).json({ message: 'Засіб не знайдено' });
        res.json(updatedTool);
    } catch (error) {
        console.error("Помилка оновлення засобу:", error);
        res.status(500).json({ message: 'Помилка оновлення засобу' });
    }
});

app.post('/api/tools/assign', async (req, res) => {
    const { unitName, toolIds } = req.body;
    try {
        await Tool.updateMany(
            { _id: { $in: toolIds } },
            { $set: { assigned_to: unitName, status: 'На завданні', last_update: new Date() } }
        );
        res.json({ message: 'Засоби успішно закріплено!' });
    } catch (error) {
        console.error("Помилка закріплення засобів:", error);
        res.status(500).json({ message: 'Помилка закріплення засобів' });
    }
});

// Маршрути для підрозділів (unit)
app.get('/api/units', async (req, res) => {
    try {
        const units = await Unit.find();
        res.json(units);
    } catch (error) {
        console.error("Помилка отримання підрозділів:", error);
        res.status(500).json({ message: 'Помилка на сервері' });
    }
});

app.get('/api/units/:unitName/tools', async (req, res) => {
    try {
        const { unitName } = req.params;
        const tools = await Tool.find({ assigned_to: unitName });
        res.json(tools);
    } catch (error) {
        console.error("Помилка отримання засобів підрозділу:", error);
        res.status(500).json({ message: 'Помилка на сервері' });
    }
});

app.get('/api/soldiers', async (req, res) => {
    try {
        const soldiers = await Soldier.find().select('-password'); // Не віддаємо паролі
        res.json(soldiers);
    } catch (error) {
        console.error("Помилка отримання користувачів:", error);
        res.status(500).json({ message: 'Помилка на сервері' });
    }
});

// 2. Створити нового користувача
app.post('/api/soldiers', async (req, res) => {
    try {
        const { login, password, role, full_name, rank, position, unit } = req.body;
        // Перевірка, чи не існує вже користувач з таким логіном
        const existingSoldier = await Soldier.findOne({ login });
        if (existingSoldier) {
            return res.status(400).json({ message: 'Користувач з таким логіном вже існує' });
        }
        const newSoldier = new Soldier({ login, password, role, full_name, rank, position, unit });
        await newSoldier.save();
        res.status(201).json(newSoldier.toObject({ versionKey: false, transform: (doc, ret) => { delete ret.password; return ret; } })); // Повертаємо без пароля
    } catch (error) {
        console.error("Помилка створення користувача:", error);
        res.status(500).json({ message: 'Помилка створення користувача' });
    }
});

// 3. Оновити користувача за ID (пароль не оновлюємо тут)
app.put('/api/soldiers/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { login, role, full_name, rank, position, unit } = req.body; // Пароль не беремо

        // Перевірка, чи не намагаються змінити логін на вже існуючий (окрім свого)
        const existingSoldier = await Soldier.findOne({ login });
        if (existingSoldier && existingSoldier._id.toString() !== id) {
            return res.status(400).json({ message: 'Користувач з таким логіном вже існує' });
        }

        const updatedSoldier = await Soldier.findByIdAndUpdate(
            id,
            { login, role, full_name, rank, position, unit },
            { new: true } // Повертає оновлений документ
        ).select('-password');

        if (!updatedSoldier) {
            return res.status(404).json({ message: 'Користувача не знайдено' });
        }
        res.json(updatedSoldier);
    } catch (error) {
        console.error("Помилка оновлення користувача:", error);
        res.status(500).json({ message: 'Помилка оновлення користувача' });
    }
});

// 4. Видалити користувача за ID
app.delete('/api/soldiers/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedSoldier = await Soldier.findByIdAndDelete(id);
        if (!deletedSoldier) {
            return res.status(404).json({ message: 'Користувача не знайдено' });
        }
        res.json({ message: 'Користувача успішно видалено' });
    } catch (error) {
        console.error("Помилка видалення користувача:", error);
        res.status(500).json({ message: 'Помилка видалення користувача' });
    }
});
app.post('/api/units', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Назва підрозділу є обов\'язковою' });
        }
        // Перевірка на унікальність
        const existingUnit = await Unit.findOne({ name });
        if (existingUnit) {
            return res.status(400).json({ message: 'Підрозділ з такою назвою вже існує' });
        }
        const newUnit = new Unit({ name });
        await newUnit.save();
        res.status(201).json(newUnit);
    } catch (error) {
        console.error("Помилка створення підрозділу:", error);
        res.status(500).json({ message: 'Помилка створення підрозділу' });
    }
});

// 2. Видалити підрозділ за ID
app.delete('/api/units/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedUnit = await Unit.findByIdAndDelete(id);
        if (!deletedUnit) {
            return res.status(404).json({ message: 'Підрозділ не знайдено' });
        }
        res.json({ message: 'Підрозділ успішно видалено' });
    } catch (error) {
        // Додамо перевірку, чи не використовується підрозділ
        if (error.code === 11000 || error.message.includes('foreign key constraint')) { // Приклад, реальна перевірка залежить від БД
             return res.status(400).json({ message: 'Неможливо видалити підрозділ, оскільки він використовується.' });
        }
        console.error("Помилка видалення підрозділу:", error);
        res.status(500).json({ message: 'Помилка видалення підрозділу' });
    }
});

app.get('/api/analytics/tools-by-unit', async (req, res) => {
    try {
        const stats = await Tool.aggregate([
            // 1. Групуємо документи за полем 'assigned_to'
            {
                $group: {
                    _id: "$assigned_to", // Групуємо по назві підрозділу
                    count: { $sum: 1 }   // Рахуємо кількість документів у кожній групі
                }
            },
            // 2. Фільтруємо ті, де підрозділ не вказано (null або "")
            {
                $match: {
                    _id: { $ne: null, $ne: "" } 
                }
            },
            // 3. Перейменовуємо поле _id на unitName для зручності
            {
                $project: {
                    _id: 0, 
                    unitName: "$_id",
                    count: 1
                }
            }
        ]);
        res.json(stats);
    } catch (error) {
        console.error("Помилка агрегації даних:", error);
        res.status(500).json({ message: 'Помилка отримання статистики' });
    }
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущено на порті ${PORT}`);
});