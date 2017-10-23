const passportLocalMongoose = require('passport-local-mongoose');

module.exports = function(mongoose) {
    const opts = {
        timestamps: true
    };

    const userSchema = mongoose.Schema({
        profile: {
            type: String,
            required: true,
            default: "you can put anything here!!!",
        },
        username: String,
        password: String
     }, opts);

    userSchema.plugin(passportLocalMongoose);

    return mongoose.model('User', userSchema);
}
