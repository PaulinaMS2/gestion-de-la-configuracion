const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

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


const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 20);
        const price = Math.floor(Math.random()* 20)+15;
        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(places)} ${sample(descriptors)}`,
            image: 'https://source.unsplash.com/collection/483251',
            description:' Lorem, ipsum dolor sit amet consectetur adipisicing elit. Unde deserunt rem minus tempora minima quos, incidunt aperiam corrupti eaque! Obcaecati, quasi earum! Quisquam dolorum aut minus laudantium totam porro eos.',
            price: price
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})

seedDB().then(() =>{
    mongoose.connection.close();
})

