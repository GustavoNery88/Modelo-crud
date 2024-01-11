const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
    nome: String,
    email: { type: String, unique: true, required: true },
    telefone: String,
    role: { type: String, default: 'user' },
    senha: { type: String}, // O campo senha é seletivo e não é selecionado por padrão
});

const usuario = mongoose.model('usuario', usuarioSchema);

module.exports = { usuario };