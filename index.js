//require packages
const express = require('express');
const app = express();
const passport = require('passport');
const mongoose = require('mongoose');
const flash = require('express-flash');
const session = require('express-session');
const LocalStrategy = require('passport-local');
const methodOverride = require('method-override');
const bodyParser = require("body-parser");
const keys = require('./keys.js');
const seedDB = require('./seed');
// seedDB();

//require schema models
const User = require('./models/user');

//require routes
const authRoutes = require('./routes/authRoutes');
const passRoutes = require('./routes/passRoutes');


//configure app and database
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: false }))
mongoose.connect(keys.mongodb, { useNewUrlParser: true }, (req, res) => {
    console.log('Database Connected');
});
app.use(methodOverride('_method'));
app.use(flash());

app.use(session({
    secret: keys.secretKey,
    resave: false,
    saveUninitialized: false
}));

//passport configuration
app.use(passport.initialize()); //req.user always available for user information
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    next();
})

// ======
// Routes
// ======
app.get('/', (req, res) => {
    res.render('home', { currentUser: req.user });
});

//other routes
app.use(passRoutes);
app.use(authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});