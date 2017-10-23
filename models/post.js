module.exports = function(mongoose) {
    const postSchema = mongoose.Schema({
        username: String,
        post: String
    })

    return mongoose.model('Post', postSchema);
}
