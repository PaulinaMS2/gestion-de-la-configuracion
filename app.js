const express = require('express');
const path = require('path') 
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError')
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const session = require('express-session');
const flash = require('connect-flash');

const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');


mongoose.connect('mongodb://0.0.0.0:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // Otras opciones de configuración si es necesario
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,'public')))


const sessionConfig={
    secret: 'asdasdasda',
    resave: false,
    saveUninitialized: true,
    cookie:{
        httpOnly:true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //Miliseconds
        maxAge:1000 * 60 * 60 * 24 * 7 
    }
}
app.use(session(sessionConfig))
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));


passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next) =>{ //middleware
    console.log(req.session);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});


app.use('/', userRoutes);
app.use('/campamentos', campgroundRoutes);
app.use('/campamentos/:id/reviews', reviewRoutes);


app.get('/', (req,res)=>{
    res.render('home')
});


app.all('*',(req,res,next)=>{
    next(new ExpressError('Página No Encontrada', 404));
});

app.use((err,req,res,next)=>{
    const {statusCode = 500} = err;
    if(!err.message) err.message = 'Oh no, algo anda mal'
    res.status(statusCode).render('error',{err})
});

app.listen(3000, () => console.log(`listening on http://localhost:${3000}/campamentos`));

