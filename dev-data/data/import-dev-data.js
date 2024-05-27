const fs = require('fs');
const Tour = require(`./../../models/tourModel`);
const User = require(`./../../models/userModels`);
const Review = require(`./../../models/reviewModel`);
const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config({ path: './config.env' });

console.log(process.env.DATABASE);
const DB = process.env.DATABASE.replace(
     '<password>',
     process.env.DATABASE_PASSWORD,
);

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
     fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'),
);

// Import data

const importData = async () => {
     try {
          await Tour.create(tours);
          await User.create(users, { validateBeforeSave: false });
          await Review.create(reviews);
          console.log('data Sucessfully imported');
          process.exit();
     } catch (e) {
          console.log(e);
     }
};

const deleteData = async () => {
     try {
          await Tour.deleteMany();
          await User.deleteMany();
          await Review.deleteMany();
          //delete all data
          console.log('data Sucessfully deleted');
          process.exit();
     } catch (e) {
          console.log(e);
     }
};

if (process.argv[2] === '--import') {
     importData();
}
if (process.argv[2] === '--delete') {
     deleteData();
}
console.log(process.argv[2]);

// here above we are replacing environment variables

// connecting database
mongoose
     .connect(DB)
     .then(() => console.log('DB IS CONNECTED'))
     .catch((err) => console.error('Error connecting to MongoDB:', err));
