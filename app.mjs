import './config.mjs';
import './db.mjs';

//import mongoose and retireve Review model
import mongoose from 'mongoose';
const Egg = mongoose.model('Egg');

import express from 'express';
const app = express();

// set up express static
import url from 'url';
import path from 'path';
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, 'public')));

import handlebars from 'hbs';
// configure templating to hbs
app.set('view engine', 'hbs');

handlebars.registerHelper('split', function (context, options) {
  if (!context) return [];
  return context.split(options.hash.delimiter || "\n");
});

// body parser (req.body)
app.use(express.urlencoded({ extended: false }));

//set session option and middlware to use it
// import session from 'express-session';
// const sessionOptions = { 
//   secret: 'secret for signing session id ooh spooky', 
//   saveUninitialized: false, 
//   resave: false 
// };
// app.use(session(sessionOptions));

//ReviewObj for easy logging and tracking
class EggObj {
  constructor(eggobj) {
    this['eggnum'] = eggobj['eggnum']; 
    this['spotcolor'] = eggobj['spotcolor']; 
    this['scale'] = eggobj['scale'];
    this['xPos'] = eggobj['xPos'];
    this['yPos'] = eggobj['yPos']; 
    this['animationTime'] = eggobj['animationTime']; 
    this['message'] = eggobj['message']; 
    this['createdAt'] = eggobj['createdAt']; 
  }
}

app.use(function(req, res, next) { // TODO: use middleware required for logging request
  console.log(req.params)
  // const poo = await User.find();
  // console.log(poo);
  console.log(req.session)
  console.log('Method:', req.method);
  console.log('Path:', req.path);
  console.log('Query:', req.query);
  console.log('Body:', req.body);
  next();
});

// app.use((req, res, next) => {
//     const error = new Error("Route not found");
//     error.status = 404;
//     next(error);
// });
app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
      error: {
          message: error.message,
      },
  });
  next(error);
});
//route: GET /reviews/add - show the add review form
// app.get('/reviews/add', (req, res) => {
//   //update pageVisits
//   if(req.session.pageVisits) {
//     req.session.pageVisits += 1;
//   } else{
//     req.session.pageVisits = 1;
//   }
//   res.render("add", {count:req.session.pageVisits, h1title:"Write a Review"});
// });

//route: GET /reviews/mine - show my reviews
// app.get('/reviews/mine', (req, res) => {
//   //update pageVisits
//   if(req.session.pageVisits) {
//     req.session.pageVisits += 1;
//   } else{
//     req.session.pageVisits = 1;
//   }
//   if(!req.session.addedThisSession) {
//     req.session.addedThisSession = [];
//   }
//   res.render("index", {count: req.session.pageVisits, h1title: "My Reviews", reviews: req.session.addedThisSession});
// });
app.get('/', async(req, res) => {
  res.redirect("/egg-garden");
});
app.get('/add-egg', async(req, res) => {
  res.render("addegg");
});
app.get('/library/reading-room', async(req, res) => {
  res.render("readingroom");
});

app.post('/add-egg/add', async(req, res) => {
  const newEgg = new Egg({
    eggnum: req.body.eggnum,
    spotcolor: req.body.spotcolor,
    scale: req.body.scale,
    xPos: req.body.xPos,
    yPos: req.body.yPos,
    animationTime: req.body.animationTime,
    message: req.body.message,
    createdAt: req.body.createdAt
  });
   await newEgg.save();
   res.redirect("/add-egg");
});
// const EggSchema = new mongoose.Schema({
//   eggnum: Number,
//   spotcolor: String,
// scale: Number,
//   xPos: Number,
//   yPos: Number,
//   message: String,
//   createdAt: Date
// });
app.get('/photo-forest', (req, res) => {
  res.render("photoforest");
});
app.get('/library', (req, res) => {
  res.render("library");
});
app.get('/egg-garden', async(req, res) => {
    //update pageVisits
    // if(req.session.pageVisits) {
    //   req.session.pageVisits += 1;
    // } else{
    //   req.session.pageVisits = 1;
    // }
    const e = await Egg.find({});
    const eggList = [];

    if(e+'') {
        e.forEach(function(eg) {
        const newE = new EggObj(eg);
        eggList.push(newE);    
        });   

    }else {
        console.log('found none' + e); //throw err
    }
    res.render("egggarden", {eggs: eggList});
  });
//route: POST /foreman/add - process a new foreman
// app.post('/foreman/add', async (req, res) => {
//   const newJob = new Job({
//     _id: new mongoose.Types.ObjectId(),
//     jobNumber: req.body.jobNumber,
//     jobName: req.body.jobName,
//     jobLocation: req.body.jobLocation,
//     jobStartDate: req.body.jobStartDate,
//     active: true,
//     foreman: req.body.foreman
//    });
//    await newJob.save(); //save new review in db
// //    if(!req.session.addedThisSession) {
// //     req.session.addedThisSession = [];
// //    }
// //    req.session.addedThisSession.push(new ReviewObj({
// //       courseNumber: req.body.courseNumber,
// //       courseName: req.body.courseName,
// //       semester: req.body.semester,
// //       year: req.body.year,
// //       professor: req.body.professor,
// //       review: req.body.review
// //     }));
    
//   res.redirect('/foreman');
// });

//route: GET / - show all course reviews
// app.get('/', async (req, res) => {
//   //update pageVisits
// //   if(req.session.pageVisits) {
// //     req.session.pageVisits += 1;
// //   } else{
// //     req.session.pageVisits = 1;
// //   }
  
//   //deconstruct query into list of [k,v], remove where v='', then reconstruct into Object
//   req.query = Object.fromEntries(
//     Object.entries(req.query).filter((value) => value[1] !== "")
//   );
  
//   //retrieve reviews
//   const c = await Review.find(req.query);
//   const reviewList = [];

//   if(c+'') {
//     c.forEach(function(rev) {
//       const newRev = new ReviewObj(rev);
//       reviewList.push(newRev);    
//     });   

//   }else {
//     console.log('found none' + c); //throw err
//   }
  
//   res.render("index", {count: req.session.pageVisits, h1title: "All Reviews", reviews: reviewList});
// });


app.listen(process.env.PORT || 3000);