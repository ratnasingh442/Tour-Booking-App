const dotenv = require('dotenv');
const mongose = require('mongoose');

process.on('uncaughtException', err => {
  console.log(err.name, err.message);
  console.log('UNHANDLED EXCEPTION.Shutting down....');
  process.exit(1);
});
const app = require('./app');
// const Tour = require('./../after-section-06/model/tourModel');

dotenv.config({ path: './config.env' });
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => {
    console.log('DB connection successful');
    // console.log(con.connection);
  });

// const testTour = new Tour({
//   name: 'The Path Finder',
//   rating: 4.7,
//   price: 497
// });
// testTour
//   .save()
//   .then(doc => {
//     console.log(doc);
//   })
//   .catch(err => {
//     console.log(`Error = ${err}`);
//   });
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION.Shutting down....');
  server.close(() => {
    process.exit(1);
  });
});
