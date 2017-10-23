const ls = require('lorem-ipsum')

let data = {
    posts: [],
}

for (let i = 0; i < 10; i++) {
   data.posts.push({
        username: "asdfjlksdfj",
        post:  `<div id="great">${ls({count: 10, units: 'sentences'})}</div>`
   });
}

module.exports = data
