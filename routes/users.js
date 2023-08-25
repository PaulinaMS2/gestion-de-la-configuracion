const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const { storeReturnTo } = require('../middleware');

router.get('/registro', (req, res) => {
    res.render('users/register');
});

router.post('/registro', catchAsync( async (req,res, next)=>{
    try{
    const {email,username,password} = req.body;
    const user = new User({email,username});
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, err =>{
        if (err) return next(err);
        req.flash('success', 'Bienvenido a Naturalplaces');
        res.redirect('/campamentos');
    });
    } catch(e){
        req.flash('error',e.message);
        res.redirect('registro')
    }
}));

router.get('/inicio', (req,res)=>{
    res.render('users/login');
});

router.post('/inicio', storeReturnTo, passport.authenticate('local', {failureFlash:true, failureRedirect: '/inicio'}), (req,res) =>{
    req.flash('success', 'Hola de nuevo!' );
    const redirectUrl = res.locals.returnTo || '/campamentos';
    delete req.session.returnTo;
    res.redirect(redirectUrl);

})

router.get('/cierre', (req, res, next) =>{
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', '¡Hasta Pronto!');
        res.redirect('/campamentos');
    });
    
});



module.exports = router;