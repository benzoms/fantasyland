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
app.get('/library/reading-room', (req, res) => {
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
let limit = new Date(0);

  function checkLimit() {
    const now = new Date();
    if (now < limit) {
      const timeDifference = limit - now;
      const minutes = Math.floor(timeDifference / 60000);
      const seconds = ((timeDifference % 60000) / 1000).toFixed(0);
      return `I am still *ribbit* resting. Return in ${minutes} minutes and ${seconds} seconds.`;
    } else {
      // Set the limit datetime to 5 minutes from now
      
      return 'okay';
      alert("Good");
    }
  }

  function setNewLimit() {
    const now = new Date();
    limit = new Date(now.getTime() + 10 * 60000);
  }

app.get('/photo-forest', (req, res) => {
  let cl = checkLimit();
  console.log(cl);
  console.log(typeof cl);
  console.log(limit);
  if(cl != 'okay'){
    res.render("photoforest", {frogadvice:(String(cl)+'\n').split('\n'), frogresting:true});
  }else{
    
    res.render("photoforest", {frogadvice:'Doth thou require guidance?\n'.split('\n')});
   
  }
  
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

  
import OpenAI from 'openai'
const openai = new OpenAI({ apiKey:process.env.OPENAI_API_KEY });
app.post('/sage-advice', async(req, res) => {
  setNewLimit();
  if(!req.body.topic){
    res.render('photoforest', {frogadvice:'Somethin wrong come back later\n'});
  }else{
    
    const prompt = "Give me advice on this: " +req.body.topic;
    const completion = await openai.chat.completions.create({
      "model": "gpt-3.5-turbo",
      "messages": [
        {
          "role": "system",
          "content": "You are a mystical frog tasked with giving advice. You will be given a topic on which you should give wise, sage, advice (if possible use a frog metaphor). In all your responses, say *ribbit* occasionally and intersperse frog puns whenever possible. After your advice, make sure to mention how tired you are at that you need to 10 minutes to rest and recharge your wisdom giving abilities. At the beginning of your response, quickly mention to remember to where sunscreen today."
        },
        {
          "role": "user",
          "content": prompt
        }
      ]
    })
    console.log(completion.choices[0].message);
    res.render('photoforest', {frogadvice:completion.choices[0].message.content.split('\n'), frogresting:true});
  }
  
})
app.post('/sage-advice2', async(req, res) => {
  // console.log(req.body.topic);
  
  // console.log(completion.choices[0].message);
  // const url = 'http://localhost:3000/api/message'
  // const poses = savePositions()
  // // to change for fetch for a post
  // // method
  // // content type header
  // // body
  
  // const opts = {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json'
  //   },
  //   body: JSON.stringify(poses)
  // }
  // const res = await fetch(url, opts)
  // const data = await res.json()
  
  const data = completion.json()
  console.log(data)
  
});


app.listen(process.env.PORT || 3000);
// console.log(chatGptExecute());