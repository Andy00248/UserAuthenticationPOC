const express = require('express');
const mongoose = require('mongoose');
const User = require('../core/users');
const UserSession = require('../core/userSessions');

const app = express();

app.use(express.json());

const port = process.env.PORT || 3000;

app.listen(port, ()=> {
    console.log(`Listening on port ${port}...`);
});

mongoose.connect("mongodb://localhost/authentication", {useNewUrlParser:true, useUnifiedTopology:true});

mongoose.connection
    .once('open', function(){
        console.log('Connected');
    })
    .on('error', (error)=>{
        console.log("Error: ", error);
    });



module.exports = app;
// test commit for git push

//******************************* */

app.get('/', (req, res) => {
    res.send({
        success: true,
        message: "Welcome"
    });
});

app.post('/api/account/signup', (req, res, next) => {
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
    email = email.trim();

    // Verify email doesn't already exist
    User.find({
        email: email
    }, (err, previousUsers) => {
        if(err) {
            return res.send({
                success: false,
                message: "Error: Server error"
            });
        } else if (previousUsers.length>0) {
            return res.send({
                success: false,
                message: "Error: Account already exists"
            });
        }

        // If all good, save the new user
        const newUser = User();
        newUser.email = email;
        newUser.password = newUser.generateHash(password);
        newUser.save((err, user) => {
            if(err) {
                return res.send({
                    success: false,
                    message: "Error: Server error"
                });
            }
            return res.send({
                success: true,
                message: "Signed Up"
            });
        });
    });
}); // end of sign up


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
        if(users.length==0) {
            return res.send({
                success: false,
                message: 'Error: Account doesn\'t exist. Please signup first.'
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

        /*
        Trying to see if user is already logged in. 
        Giving some error for some reason. When doing multiple signins 
        with the same user object.
        */

        // UserSession.find({
        //     userId: user._id
        // }, (err, users)=> {
        //     if(err) {
        //         return res.send({
        //             success: false,
        //             message: "Error: Server error"
        //         });
        //     } 
        //     if(users.length != 0) {
        //         return res.send({
        //             success: false,
        //             message: 'Error: Already logged in.'
        //         });
        //     }
        // });

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
            message: 'You have been logged out successfully'
        });
    });
});
