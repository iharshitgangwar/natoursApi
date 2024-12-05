const dotenv = require('dotenv'); //this is for reading env file
const mongoose = require('mongoose');

dotenv.config({ path: './config.env' });
const app = require(`./app`);
//reading env file and saving them to nodejs env variable

// we use it because it will catch error
process.on('uncaughtException', (err) => {
     console.log(err.name, err.message);
     app.close(() => {
          process.exit(1);
     });
});

const DB = process.env.DATABASE.replace(
     '<password>',
     process.env.DATABASE_PASSWORD,
);

console.log(process.env.NODE_ENV);
// here above we are replacing environment variables

// connecting database
mongoose.connect(DB).then(() => console.log('DB IS CONNECTED'));

// transfered model and schema to model folder so be can keep business logic

const port = process.env.PORT || 3000;
app.listen(port, () => {
     console.log(`server is running at port ${port}`);
});
// we do not depend completly on these we create own as we created errorhandler
process.on('unhandledRejection', (err) => {
     console.log(err.name, err.message);
     app.close(() => {
          process.exit(1);
     });
});


