// import express from 'express';
import express from 'express'
import cors from 'cors';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
// import path from 'path';
import config from './config.js';
import userRouter from './routers/userRouter.js';

mongoose
  .connect(config.MONGODB_URL, {

  })
  .then(() => {
    console.log('Connected to mongodb.');
  })
  .catch((error) => {
    console.log("Connection error: " + error);
  });
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/api/users', userRouter);
app.use((req, res, next) => {
  const err = new httpError(404)
  return next(err);
});
app.use((err, req, res, next) => {
    const status = err.name && err.name === 'ValidationError' ? 400 : 500;
    res.status(status).send({ message: err.message });
  });
app.listen(3000, () => {
  console.log('serve at http://localhost:5000');
});