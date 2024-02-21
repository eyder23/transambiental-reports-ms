// Created By Eyder Ascuntar Rosales
const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION!');
  console.log(err.name, err.message);
});

dotenv.config({ path: './config.env' });
const app = require('./express');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

console.log(`Conecting database...`);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(connection => {
    console.log(`Database conected`);
    const port = process.env.PORT || 3000;
    const server = app.listen(port, () => {
      console.log(`App running on port ${port}...`);
    });
  })
  .catch(err => {
    console.log('Could not connect to the database.', err);
    process.exit();
  });

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! ðŸ’¥ Shutting down...');
  console.log(err);
  console.log(err.name, err.message);
});
