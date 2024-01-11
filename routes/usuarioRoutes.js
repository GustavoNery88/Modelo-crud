const express = require('express');
const router = express.Router();
const { usuario } = require('../models/Usuario');

// Rota para exibir formulário de cadastro
router.get('/cadastro', (req, res) => {
    res.render('usuario/cadastroUser')
});

// Rota para processar o cadastro
router.post('/cadastro', async (req, res) => {
    try {
        const novoUsuario = new usuario({
            nome: req.body.nome,
            email: req.body.email,
            telefone: req.body.telefone,
        });

        await novoUsuario.save();
        req.flash('success', 'Usuário cadastrado com sucesso!');
        res.redirect('/usuario/cadastro');
    } catch (err) {
        const { email } = req.body
        const usuarioJaExietente = await usuario.findOne({ email: email })
        if (usuarioJaExietente) {
            // Se o erro for de chave duplicada para o campo 'email'
            req.flash('error', 'Este e-mail já está cadastrado!');
            res.redirect('/usuario/cadastro');
        } else {
            // Outro tipo de erro
            console.error(err);
            req.flash('error', 'Erro ao cadastrar usuário!');
            res.redirect('/usuario/cadastro');
        }
    }
});


module.exports = router;
