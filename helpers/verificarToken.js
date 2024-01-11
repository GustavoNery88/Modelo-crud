require('dotenv').config();
const jwt = require('jsonwebtoken')

const verificarToken = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        req.flash('error', 'Você precisa ser administrador, faça o login!');
        return res.redirect('/admin/login'); // Ou enviar uma resposta de não autorizado
    }

    jwt.verify(token, process.env.SECRET, (err, decoded) => {
        if (err) {
            req.flash('error', 'Você precisa ser administrador, faça o login!');
            return res.redirect('/admin/login'); // Ou enviar uma resposta de não autorizado
        }

        req.userId = decoded.id;
        next();
    });
};

module.exports = verificarToken;
