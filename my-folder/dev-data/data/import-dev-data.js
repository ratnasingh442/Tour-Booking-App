const fs = require('fs');
const dotenv = require('dotenv');
const mongose = require('mongoose');
const Tour = require('./../../model/tourModel');
const User = require('./../../model/userModel');
const Review = require('./../../model/reviewModel');

dotenv.config({ path: './config.env' });
const app = require('./../../app');
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
  });
//READ JSON FILE
const tour = JSON.parse(fs.readFileSync(`${__dirname}\\tours.json`, 'utf-8'));
const user = JSON.parse(fs.readFileSync(`${__dirname}\\users.json`, 'utf-8'));
const review = JSON.parse(fs.readFileSync(`${__dirname}\\reviews.json`, 'utf-8'));
//console.log(tour);

//IMPORT DATA INTO DATABASE
const importData = async () => {
  try {
    await Tour.create(tour);
    await User.create(user,{ validateBeforeSave: false });
    await Review.create(review);
    console.log('Data successfully loaded');
  } catch (err) {
    console.log(err);
  }
};

//DELETE DATA FROM DATABASE

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('Data successfully deleted from DB');
  } catch (err) {
    console.log(err);
  }
};
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

// const port = process.env.PORT || 3000;
// app.listen(port, () => {
//   console.log(`App running on port ${port}...`);
// });
