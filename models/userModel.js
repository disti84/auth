import mongoose from 'mongoose';
const Schema = mongoose.Schema
import bcrypt from 'bcrypt'
const saltRounds = 10;
// const myPlaintextPassword = 's0/\/\P4$$w0rD';
// const someOtherPlaintextPassword = 'not_bacon';


const userSchema = new Schema
(
    {
        name: { type: String, required: true },
        email: 
        {
            type: String,
            required: true,
            index: true,
            unique: true,
        },
        password: { type: String, required: true },
        isAdmin: { type: Boolean, required: true, default: false },
        refreshToken:{type: String}
    },
    {
        collection: 'Authorization'
    }
);


userSchema.static('authenticate', function(email, password, callback)
{
    // if(method !== 'local')
    //     return;

    this.findOne({'email' : email}).exec(function (err, user)
    {
        if(err)
        {
            return callback(err);
        }
        else if (!user)
        {
            let err = new Error('User not found');
            err.status = 401;
            return callback(err);
        }
        bcrypt.compare(password, user.password, function(err, result)
        {
            if(result)
            {
                return callback(null, user);
            }
            else
            {
                return callback();
            }
        })
    })
});
userSchema.pre("save", function(next) {
    if(!this.isModified("password")) {
        return next();
    }
    this.password = bcrypt.hashSync(this.password, saltRounds);
    next();
});

const User = mongoose.model('User', userSchema);
export default User;