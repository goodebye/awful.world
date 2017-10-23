module.exports = function(mongoose) {
    const opts = {
        timestamps: true
    };

    const postSchema = mongoose.Schema({
        user_id: {
            type: String,
            required: true,
        },
        username: {
            type: String,
            required: true,
        },
        post: {
            type: String,
            required: true,
        },
    }, opts);

    return mongoose.model('Post', postSchema);
}
