const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const verificarToken = require('../helpers/verificarToken');
const { usuario } = require('../models/Usuario');

// Rota para exibir todos os usuários cadastrados
router.get('/usuarios', verificarToken, (req, res) => {
    usuario.find().lean().then((usuarios) => {
        res.render('admin/usuarios', { isAuthenticated: true, usuarios: usuarios });
    });
});


router.get('/cadastro', (req, res) => {
    res.render('admin/cadastroAdmin')
});

// Rota para processar o cadastro
router.post('/cadastro', async (req, res) => {
    try {
        let salt = await bcrypt.genSalt(10);
        let hash = await bcrypt.hash(req.body.senha, salt);

        const novoAdmin = new usuario({
            nome: req.body.nome,
            email: req.body.email,
            telefone: req.body.telefone,
            senha: hash,
            role: req.body.role,
        });

        await novoAdmin.save();
        req.flash('success', 'Admin cadastrado com sucesso!');
        res.redirect('/admin/cadastro');

    } catch (err) {
        const { email } = req.body
        const adminJaExietente = await usuario.findOne({ email: email })

        if (adminJaExietente) {
            console.error(err);
            // Se o erro for de chave duplicada para o campo 'email'
            req.flash('error', 'Este e-mail já está cadastrado.');
            res.redirect('/admin/cadastro');
        }

        else {
            // Outro tipo de erro
            console.error(err);
            req.flash('error', 'Erro ao cadastrar admin.');
            res.redirect('/admin/cadastro');
        }

    }
});


// // Exibir para tela de edição de usuário
router.get('/usuarios/edit/:id', verificarToken, (req, res) => {
    usuario.findOne({ _id: req.params.id }).lean().then((usuarios) => {
        res.render('admin/usuarioEdit', { usuarios: usuarios })
    })
})

router.post('/usuarios/edit', verificarToken, async (req, res) => {
    try {
        const existingUser = await usuario.findOne({ email: req.body.email, _id: { $ne: req.body.id } });

        if (existingUser) {
            // Se o email já existe para outro usuário
            req.flash('error', 'Este e-mail já está cadastrado para outro usuário!');
            res.redirect('/admin/usuarios/edit/' + req.body.id); // Redirecionar de volta à página de edição
        } else {
            let filter = { _id: req.body.id }
            let update = { nome: req.body.nome, email: req.body.email, telefone: req.body.telefone }

            await usuario.findOneAndUpdate(filter, update);

            req.flash("success", "Usuário atualizado com sucesso!")
            res.redirect('/admin/usuarios');
        }
    } catch (err) {
        console.log(err);
        req.flash("error", "Erro ao atualizar usuário!")
        res.redirect('/admin/usuarios');
    }
});



// // Rota para apagar usuários cadastrado
router.get('/usuarios/apagar/:id', verificarToken, async (req, res) => {

    try {
        const deletedUser = await usuario.findOneAndDelete({ _id: req.params.id });
        if (!deletedUser) {
            req.flash('error', 'Usuário não encontrado!');
        } else {
            req.flash('success', 'Usuário apagado com sucesso!');
        }
        res.redirect('/admin/usuarios');
    } catch (error) {
        // Erro ao apagar o usuário
        console.error(error);
        req.flash('error', 'Erro ao apagar o usuário!');
        res.redirect('/admin/usuarios');
    }
});



// Para exibir a tela de login de administração
router.get('/login', (req, res) => {
    res.render('admin/login!')
})

router.post('/login', async (req, res) => {
    const { email, senha } = req.body;
    const user = await usuario.findOne({ email });

    if (user) {
        const senhaCorreta = await bcrypt.compare(senha, user.senha);
        if (!senhaCorreta) {
            req.flash('error', 'Senha incorreta!');
            return res.redirect('/admin/login');
        }

        try {
            // Geração do token
            const secret = process.env.SECRET;
            const token = jwt.sign({ id: user._id }, secret, { expiresIn: '1h' }); // Expira em 1 hora

            // Enviar o token para o cliente (por exemplo, como cookie ou no corpo da resposta)
            res.cookie('token', token, { httpOnly: true }); // Exemplo usando cookie HTTP-only

            req.flash('success', 'Login bem-sucedido!');
            res.redirect('/admin/usuarios');
        } catch (error) {
            console.error(error);
            req.flash('error', 'Erro ao processar o login!');
            res.redirect('/admin/login');
        }
    } else {
        req.flash('error', 'Admin não encontrado!');
        res.redirect('/admin/login');
    }
});

// Rota para logout
router.get('/logout', (req, res) => {
    res.clearCookie('token'); // Limpar cookie, se estiver usando cookies para armazenar o token
    req.flash('success', 'Saiu!');
    res.redirect('/admin/login'); // Redirecionar para a página de login
});


module.exports = router;
