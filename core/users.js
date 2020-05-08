const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
   email: {
       type: String,
       default: ''
   }, 
   password: {
       type: String,
       default: ''
   },
   isDeleted: {
       type: Boolean,
       default: false
   },
   signUpDate: {
       type: Date,
       default: Date.now()
   }
});

UserSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

UserSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
}

const User = mongoose.model('User', UserSchema);

module.exports = User;