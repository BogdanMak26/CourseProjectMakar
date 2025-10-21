const mongoose = require('mongoose');

const soldierSchema = new mongoose.Schema({
    login: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ['admin', 'operator'] },
    full_name: String,
    rank: String,
    position: String,
    unit: String
});

// Третій аргумент ('soldirer') каже Mongoose використовувати вашу існуючу колекцію
module.exports = mongoose.model('Soldier', soldierSchema, 'soldirer');