const express = require('express');
const path = require('path');
const morgan = require('morgan'); //middleware this will show req in console
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const xss = require('xss-clean');
const bodyparser = require('body-parser');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const userRouter = require('./routes/userRouts');
const tourRouter = require('./routes/tourRouts');
const viewRouter = require('./routes/viewRoutes');
const reviewRouter = require('./routes/reviewRouts');
const bookingRouter = require('./routes/bookingRouts');
const appError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const bookingController = require('./controllers/bookingController');
const cors = require('cors');
const compression = require('compression');
const cookieParser = require('cookie-parser');

// 1Middleware
const app = express();
// here we are telling express engine to use pug for view
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.set('trust proxy', 1);
// Global Middleware
app.use(express.static(path.join(__dirname, 'public'))); //we do not need to mention address we just type /overview.html it will find and run

// Enable CORS for all routes
app.use(cors({ origin: '*', credentials: true }));
app.options('*', cors());
// this will set security http header
app.use(
     helmet({
          contentSecurityPolicy: false,
     }),
);
if (process.env.NODE_ENV === 'Development') {
     app.use(morgan('dev')); //you can get more by looking for this middleware
}

// rate limit for per ip to req

const limiter = rateLimit({
     max: 100,
     windowMs: 60 * 60 * 1000,
     message: 'Too many requests from this IP, please try again in an hour',
});

app.use('/api', limiter);
app.post(
     '/webhook-checkout',
     bodyparser.raw({ type: 'application/json' }),
     bookingController.webHookCheckout,
);

// this is for parsing form data
// app.use(express.urlencoded({ extended: true, limit: '10b' }));
app.use(cookieParser());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
// Data sanitization so attacker can not send query in the body NoSql eg {$gt:""}
app.use(mongoSanitize());

// Data sanitize againt Html code
app.use(xss());

// this middleware will clear url like sort=duration&sort=created so it will remove second or duplicate
app.use(
     hpp({
          whitelist: [
               'duration',
               'ratingQuantity',
               'ratingsAverage',
               'maxGroupSize',
               'difficulty',
               'price',
          ],
     }),
);

//middleware step 1md

// const tours = JSON.parse(
//    fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
// );

//ownmiddleware
app.use(compression());
app.use((req, res, next) => {
     req.requestTime = new Date().toISOString();
     next();
     //If we will not call next it will not go further
});

//this is get request

// Rout Handlers

// tour function transferd from here to new file
// user routs transferd from here
//Routs

// //here we created function of the req and res code:1:2
// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id', getTour);
// app.post('/api/v1/tours', newTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

// we replaced code 1:2 with this
// this code transferd to new files -controlles

// 3 Routs

// transferd from here to different module or file
// mounting routs so we can make routs easily like we made
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter); //here we are here tourRouter is middle ware function
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

//starting server at 3000 port
// set to new file

// handling not found
// here this will not effect because this is after the main used url but it will show only the not found urls
app.all('*', (req, res, next) => {
     // const err = new Error(`Not Found ${req.originalUrl}`);
     // err.status = 'fail';
     // err.statusCode = 404;

     //in express if we pass something in the next then it auto take that there is serror and it reachs to global error function
     next(new appError(`Requested url ${req.originalUrl} not found! `, 404));
});

// global error function
app.use(globalErrorHandler);

module.exports = app;
