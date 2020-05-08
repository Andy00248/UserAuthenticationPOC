const User = require('../core/users');

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

    return res.send("Success");

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
