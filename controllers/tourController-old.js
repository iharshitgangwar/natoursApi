const fs = require('fs');

const tours = JSON.parse(
   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`),
);

// here if id will we not found it will return status code 404 not go anywhere other means not go to next()
exports.Checkid = (req, res, next, val) => {
   if (req.params.id * 1 > tours.length)
      return res.status(404).json({ status: 'failed', message: 'Invalid id' }); //checking if id exist
   next();
};

exports.checkBody = (req, res, next) => {
   if (!req.body.name || req.body.price) {
      return res
         .status(404)
         .json({ status: 'failed', message: 'Missing name or price' });
   }
   next();
};

exports.getAllTours = (req, res) => {
   //here data is needed to send
   //here tours.lengh is used to send lenght of tours
   res.status(200).json({
      status: 'sucess',
      time: req.requestTime,
      results: tours.length,
      data: {
         tours,
      },
   });
};
exports.getTour = (req, res) => {
   //console.log(req.params.id); //by this we can get id eg tours:5 then we will get {id:'5'}
   //and if we want to make any parameter option we can make it with ?-eg :id:x:y? here y is optional
   const id = req.params.id * 1; //it will convert strint o number by multiplying to one
   const tour = tours.find((el) => el.id === id);
   res.status(200).json({
      status: 'sucess',
      data: {
         tour,
      },
   });
};
//req is for request in Post we can send data from postman(client) to server
//but Express do not contains req data on body so we needs middleware to recieve cliet data
exports.newTour = (req, res) => {
   const newID = tours[tours.length - 1].id + 1; //here we are getting tourslast id
   //body is vailable beacouse of express middleware we used in step 1 md
   const newTours = Object.assign({ id: newID }, req.body); //here Object.assign is assigning new object to the tours
   tours.push(newTours);

   //here in above we created array but be have not write in file so down we are writing it
   fs.writeFile(
      `${__dirname}/dev-data/data/tours-simple.json`,
      JSON.stringify(tours),
      (err) => {
         //201 for created
         res.status(201).json({
            status: 'success',
            data: {
               tours: newTours,
            },
         });
      },
   );

   //  res.send('done'); we can not send two responce and also after send responce post will be closed
};
exports.updateTour = (req, res) => {
   res.status(200).json({
      status: 'success',
      data: {
         tour: '<Updated tour></Updated>',
      },
   });
};

exports.deleteTour = (req, res) => {
   //    if (req.params.id * 1 > tours.length)   //this was code before param middleware
   //       res.status(404).json({ status: 'failed', message: 'Invalid id' }); //checking if id exist
   //this will not show data becouse 204 means no content
   res.status(204).json({
      status: 'success',
      data: null,
   });
};
