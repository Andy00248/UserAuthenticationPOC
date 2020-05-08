const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSessionsSchema = new Schema({
    userId: {
        type: String,
        default: ''
    },
    timestamp: {
        type: String,
        default: Date.now()
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
});

const UserSession = mongoose.model('UserSession', userSessionsSchema);

module.exports = UserSession;