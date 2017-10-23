const bodyParser = require('body-parser');
const express = require('express');
const exphbs = require('express-handlebars');
const session = require('express-session');
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const flash = require('connect-flash');
const mn = require('./magic_numbers.json');

mongoose.connect('mongodb://localhost');
mongoose.Promise = global.Promise;

// models
const Post = require('./models/post')(mongoose);
const User = require('./models/user')(mongoose);

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(session({ secret: 'keyboard cat' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.engine('handlebars', exphbs({defaultLayout: false}));
app.set('view engine', 'handlebars');

app.get('/', function(req, res) {
    Post.find({}).sort({updatedAt: '-1'}).limit(mn.postsPerPage).exec(function (err, posts) {
        if (!err) {
            res.render('home', {posts: posts, user: req.user});
        }
    });
});

app.get('/login', (req, res) => {
    res.render('login', { user : req.user, error: req.flash('error')})
});

app.post('/login', passport.authenticate('local', { failureRedirect: '/', failureFlash: true }), (req, res, next) => {
    req.session.save((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
});

app.post('/register', (req, res) => {
        User.register(new User({ username : req.body.username }), req.body.password, (err, user) => {
        if (err) {
          return res.render('home', { error : err.message });
        }

        passport.authenticate('local')(req, res, () => {
            req.session.save((err) => {
                if (err) {
                    return next(err);
                }
                res.redirect('/');
            });
        });
    });
});

app.get('/logout', (req, res, next) => {
    req.logout();
    req.session.save((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
});

app.get('/post', function(req, res) {
    res.render('create-post');
});

app.get('/:username', function(req, res) {
    User.findOne({username: req.params.username}).exec(function (err, user) {
        console.log("hey: " + user);
        if (!err) {
            Post.find({username: user.username}).sort({updatedAt: '-1'}).limit(mn.postsPerPage).exec(function (err, posts) {
                if (!err) {
                    console.log(posts);
                    res.render('profile', {posts: posts, user: req.user, profileUser: user});
                }
                else {
                    console.log("wtf!!!!")
                }
             });
        }
        else {
            res.redirect('/40fucking4');
        }
    });
});

app.get('/:username/:_id', function(req, res) {
    Post.findOne({_id: req.params._id}).exec(function (err, post) {
        if (!err) {
            res.render('view-post', post);
        }
    });
});

app.post('/post', function(req, res) {
    const post = new Post({ user_id: req.user._id, username: req.user.username, post: req.body.post});
    post.save(function(err, post) {
        if (err) return console.error(err);
        else res.redirect('/');
    })
});

app.listen(8080);
