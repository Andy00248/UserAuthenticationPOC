const User = require('../core/users');
const UserSession = require('../core/userSessions');

app.post('/api/account/signin', (req, res, next) => {
    const { body } = req;
    const { password } = body;
    let { email } = body;

    if(!email) {
        return res.send({
            success: false,
            message: "Error: Email cannot be blank"
        });
    }
    if(!password) {
        return res.send({
            success: false,
            message: "Error: Password cannot be blank"
        });
    }

    email = email.toLowerCase();

    User.find({
        email: email
    }, (err, users) => {
        if(err) {
            return res.send({
                success: false,
                message: "Error: Server error"
            });
        } 
        if(users.length!=1) {
            return res.send({
                success: false,
                message: 'Error: Invalid.'
            });
        }

        const user = users[0];
        if(!user.validPassword(password)) {
            return res.send({
                success: false,
                message: 'Error: Wrong Password!'
            });
        }

        //If all good, save User Session
        const userSession = new UserSession();
        userSession.userId = user._id;
        userSession.save((err, doc)=> {
            if (err) {
                return res.send({
                  success: false,
                  message: 'Error: Server error'
                });
            } 

            return res.send({
                success: true,
                message: 'Signed In',
                token: doc._id
            });
        });
    });
});// end of sign in

app.get('/api/account/verify', (req, res, next) => {
    const {query} = req;
    const {token} = query;
    UserSession.find({
      _id: token,
      isDeleted: false
    }, (err, sessions) => {
        if(err){
            return res.send({
                success:false,
                message: 'Err: Server Error'
            });
        }
        if(sessions.length!=1){
            return res.send({
                success:false,
                message: 'Err: Server Error'
            });
        }
        else{
            return res.send({
                success:true,
                message: 'No Error'
            });
        }
    });
}); //end of Verify

app.get('/api/account/logout', (req, res, next) => {
    const {query} = req;
    const {token} = query;
    UserSession.findOneAndUpdate({
      _id: token,
      isDeleted: false
    }, {
      $set:{isDeleted:true}
    }, null, (err, sessions) => {
        if(err) {
            console.log(err);
            return res.send({
                success:false,
                message: 'Err: Server Error'
            });
        }

        return res.send({
            success:true,
            message: 'No Error'
        });
    });
});
