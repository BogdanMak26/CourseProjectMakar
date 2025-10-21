const mongoose = require('mongoose');

const toolSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String },
    serial_number: { type: String, unique: true },
    status: { type: String, enum: ['На складі', 'На завданні', 'В ремонті'] },
    assigned_to: String,
    specs: Object, // Для простоти залишимо як гнучкий об'єкт
    last_update: Date,
    photo_path: { type: String }
});

module.exports = mongoose.model('Tool', toolSchema, 'tools_commun');