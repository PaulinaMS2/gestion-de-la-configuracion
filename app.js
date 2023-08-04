const express = require('express');
const path = require('path') 
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const Campground = require('./models/campground')
const methodOverride = require('method-override');

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

app.get('/', (req,res)=>{
    res.render('home')
})

app.get('/campamentos', async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
});

app.get('/campamentos/new', (req, res) => {
    res.render('campgrounds/new');
});

app.post('/campamentos', async (req, res) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campamentos/${campground._id}`)
})


app.get('/campamentos/:id', async (req, res,) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/show', { campground });
});

app.get('/campamentos/:id/edit', async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', { campground });
});

app.put('/campamentos/:id', async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    res.redirect(`/campamentos/${campground._id}`)
});

app.delete('/campamentos/:id', async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campamentos');
})

app.listen(3000, () => console.log(`listening on http://localhost:${3000}`));
