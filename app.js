require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const exphbs = require('express-handlebars');
const flash = require('express-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');


const app = express();

// Configuração do cookie-parser
app.use(cookieParser());

const PORT = process.env.PORT || 3000;

// Configuração da Sessão
app.use(session({
    secret: "modelo-crud",
    resave: false,
    saveUninitialized: true
}));

// initialise the flash middleware
app.use(flash());

// Template Engine
const handlebars = exphbs.create({});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

// Conection MongoDB
const Schema = mongoose.Schema;
mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        console.log('Mongo conectado');
    })
    .catch((err) => {
        console.log('Erro ao conectar ao Mongo online', err);
    });

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Adicione as rotas
const adminRoutes = require('./routes/adminRoutes.js');
const usuarioRoutes = require('./routes/usuarioRoutes.js');

app.use('/admin', adminRoutes);
app.use('/usuario', usuarioRoutes);


// Rota para a página inicial
app.get('/', (req, res) => {
    const isAuthenticated = req.cookies.token !== undefined;
    res.render('usuario/home', { isAuthenticated, isHomePage: true });
});



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
