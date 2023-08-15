const express = require('express');
const path = require('path') 
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError')
const Campground = require('./models/campground');
const methodOverride = require('method-override');
const {campgroundSchema, reviewSchema} = require('./schemas');
const campground = require('./models/campground');
const Review = require('./models/review');

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

const validateCampground = (req,res,next)=>{
    const {error}= campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el=> el.message).join(',')
        throw new ExpressError(msg,400)
    }else{
        next();
    }
}

const validateReview = (req, res, next) =>{
    const{error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el=> el.message).join(',')
        throw new ExpressError(msg,400)
    }else{
        next();
    }
}


app.get('/', (req,res)=>{
    res.render('home')
})

app.get('/campamentos',catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}));

app.get('/campamentos/new', (req, res) => {
    res.render('campgrounds/new');
});

app.post('/campamentos',validateCampground, catchAsync(async(req, res,next) => {
    // if(!req.body.campground) throw new ExpressError('Datos invalidos',400)
    //Validacion del lado del servidor
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campamentos/${campground._id}`);
}))


app.get('/campamentos/:id',  catchAsync(async (req, res,) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    res.render('campgrounds/show', { campground });
}));

app.get('/campamentos/:id/edit',  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', { campground });
}));

app.put('/campamentos/:id',validateCampground,  catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    res.redirect(`/campamentos/${campground._id}`)
}));

app.delete('/campamentos/:id',  catchAsync(async (req, res) => {
    const { id } = req.params;
    res.redirect('/campamentos');
}));

app.post('/campamentos/:id/reviews', validateReview, catchAsync(async (req,res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campamentos/${campground._id}`);
}));

app.delete('/campamentos/:id/reviews/:reviewId', catchAsync(async (req,res) =>{
    const{ id, reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, { $pull : {reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId); 
    res.redirect(`/campamentos/${id}`);
}));


app.all('*',(req,res,next)=>{
    next(new ExpressError('Página No Encontrada', 404));
});

app.use((err,req,res,next)=>{
    const {statusCode = 500} = err;
    if(!err.message) err.message = 'Oh no, algo anda mal'
    res.status(statusCode).render('error',{err})
});

app.listen(3000, () => console.log(`listening on http://localhost:${3000}`));

