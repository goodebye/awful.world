const bodyParser = require('body-parser');
const express = require('express');
const exphbs = require('express-handlebars');
const session = require('express-session');
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const flash = require('connect-flash');
const mn = require('./magic_numbers.json');

const port = process.env.PORT || 3001;

if (process.env.mode == "PRODUCTION") { 
    mongoose.connect(`mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@ds231245.mlab.com:31245/awfulworld`, {authMechanism: 'ScramSHA1'}).then(
        () => {},
        err => {  console.log(err);  }
    )
}
else {
    mongoose.connect("mongodb://localhost/aw");
}

mongoose.Promise = global.Promise;

// models
const Post = require('./models/post')(mongoose);
const User = require('./models/user')(mongoose);

const app = express();

app.use(express.static('public'));
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
    if (req.isAuthenticated())  {

        if (!req.query.page) req.query.page = 1;
    
        Post.paginate({}, { sort: { updatedAt: -1 }, page: req.query.page, limit: mn.postsPerPage }).then(function (response) {
            res.render('home', { posts: response.docs, currentPage : response.page, totalPages: response.pages, user: req.user });
    }).catch(function(err) { console.log(err) });;
    }
    else {
        res.render('home');
    }
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

app.get('/logout', isLoggedIn, (req, res, next) => {
    req.logout();
    req.session.save((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
});

app.get('/post', isLoggedIn, function(req, res) {
    res.render('create-post');
});

app.post('/post', isLoggedIn, function(req, res) {
    if (req.user) {
        const post = new Post({ user_id: req.user._id, username: req.user.username, post: req.body.post});
        post.save(function(err, post) {
            if (err) return console.error(err);
            else res.redirect('/');
        })
    }
});


app.get('/40fucking4', function(req, res) {
    res.render('notfound');
});

app.get('/:username', isLoggedIn, function(req, res) {
    User.findOne({username: req.params.username}).exec(function (err, user) {
        if (!err && user) {
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


app.get('/:username/:_id', isLoggedIn, function(req, res) {
    Post.findOne({_id: req.params._id}).exec(function (err, post) {
        if (!err) {
            res.render('view-post', post);
        }
    });
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }

    res.redirect('/');
}

app.listen(port, function() {
    console.log("and we're off!");
});
