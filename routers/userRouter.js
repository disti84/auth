import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import jwt from '../jwt.js'
import { error } from 'console';
// import { generateToken, isAuth } from '../utils';

const userRouter = express.Router();

userRouter.post(
    '/login',
    expressAsyncHandler(async (req, res) => {
      try 
      {
        const email = req.body.email;
        const password = req.body.password;
        User.authenticate(email, password, (error, user) => 
        {
            if(error)
            {
                return res.status(500).end('Internal server error')
            }
            else if(!user)
            {
                return res.status(404).end('User not found')
            }

            let token = jwt.generateAccessToken(user);
            let refreshToken = jwt.generateRefreshToken(user);
    
            User.findOneAndUpdate({email: email}, {refreshToken: refreshToken}, function(err, doc, next)
            {
              if(err)
                return res.status(500).end(err)
            });

            user.password = '';
            return res.status(200).send({user: user, token: token, refreshToken: refreshToken});
        });
      } 
      catch (err) 
      {
        res.status(500).send({ message: err.message });
      }
    })
  );

  userRouter.post(
    '/register',
    expressAsyncHandler(async (req, res) => {
      let password2 = req.body.password2
      const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
      });
      User.findOne({'email' : user.email}).exec(function(err, user)
      {
        if(user)
        {
          res.status(401).send({
            message: "Email already present"
          });
        }
      })
      if(user.password !== password2)
      {
        res.status(401).send({
          message: "Password don't match"
        });
      }
      const createdUser = await user.save();
      if (!createdUser) {
        res.status(401).send({
          message: 'Invalid User Data',
        });
      } else {
        res.send({
          _id: createdUser._id,
          name: createdUser.name,
          email: createdUser.email,
          isAdmin: createdUser.isAdmin,
        });
      }
    })
  );


  userRouter.get(
    '/token',
    expressAsyncHandler(async (req, res, next) => {

      let refreshToken = req.headers['x-refresh-token']
      User.findOne({'refreshToken' : refreshToken}).exec(function(err, user)
      {
        let resToken = jwt.verifyToken(refreshToken)
        if(user)
        {
          if(resToken.error)
          {
            if(resToken.error.name === 'TokenExpiredError')
            {
              //Fare logout
              User.findOneAndUpdate({'refreshToken':refreshToken}, {refreshToken: null}, function(err, doc, next)
              {
                  if(err)
                  {
                     console.log("Error deleting refresh token");
                     next();
                  }

              });
              return res.status(401).send(resToken.error.message + ' logged out')
            }
            else
              return res.status(401).send(resToken.error.message)
          }
          else
          {
            let token = jwt.generateAccessToken(user);
            return res.status(201).send({token: token})
          }
        }
        else
        {
          return res.status(401).send('User not found')
        }
      })
    })
    
  );

  userRouter.get(
    '/logout',
    expressAsyncHandler(async (req, res) => {
      let refreshToken = req.headers['x-refresh-token']
      User.findOneAndUpdate({'refreshToken':refreshToken}, {refreshToken: null},function(err, doc, next)
      {
          if(err)
          {
              console.log("Error deleting refresh token")
          }
          else
           res.send('User logged out')

      });
      return res.status(200).send(resToken.error.message + ' logout')
     }));
  export default userRouter;