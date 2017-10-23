const bodyParser = require('body-parser');
const express = require('express');
const exphbs = require('express-handlebars');
const db = require('./dummydb');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost');
mongoose.Promise = global.Promise;

// models
const Post = require('./models/post')(mongoose);

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.engine('handlebars', exphbs({defaultLayout: false}));
app.set('view engine', 'handlebars');

app.get('/', function(req, res) {
    Post.find({}).sort({date: 'descending'}).exec(function (err, posts) {
        if (!err) {
            res.render('home', {posts: posts});
        }
    })
});

app.get('/post', function(req, res) {
    res.render('create-post');
});


app.post('/post', function(req, res) {
    const post = new Post({ username: req.body.username, post: req.body.post});
    console.log(post);
    post.save(function(err, post) {
        if (err) return console.error(err);
        else res.redirect('/');
    })
});

app.listen(8080);

