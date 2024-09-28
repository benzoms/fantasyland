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
  res.render("readingroom", {location: 'Reading Room 1'});
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

const dateList = [
  { start: 'Sep 06, 2024 15:05:00', end: 'Oct 25, 2024 10:15:00', label: 'Until I see you again', arianow: '', width: '', percentage: ''},
  { start: 'Jul 31, 2024, 08:00:00', end: 'Sep 3, 2024 10:15:00', label: 'School Starts!', arianow: '', width: '', percentage: ''},
  { start: 'Jul 31, 2024, 08:00:00', end: 'Sep 1, 2024 10:15:00', label: '4 months!', arianow: '', width: '', percentage: ''},
  { start: 'Jul 31, 2024, 08:00:00', end: 'May 15, 2025 10:15:00', label: 'Graduation!', arianow: '', width: '', percentage: ''}
]
const updateArias = (list) => list.map(item => {
  const countDownDate = new Date(item.end).getTime();
  const startDate = new Date(item.start).getTime();

  // Get today's date and time
  const now = new Date().getTime();

  // Find the distance between now and the count down date
  const distanceWhole = countDownDate - startDate;
  const distanceLeft = countDownDate - now;

  // Time calculations for minutes and percentage progressed
  const minutesLeft = Math.floor(distanceLeft / (1000 * 60));
  const minutesTotal = Math.floor(distanceWhole / (1000 * 60));
  const progress = Math.floor(((minutesTotal - minutesLeft) / minutesTotal) * 100);

  const decminutesLeft = (distanceLeft / (1000 * 60));
const decminutesTotal = (distanceWhole / (1000 * 60));
const decprogress = (((decminutesTotal - decminutesLeft) / decminutesTotal) * 100);

  return {
    ...item,
    arianow: progress,
    width: 100-progress,
    percentage: decprogress.toString().substring(0, 6) + "%"
  }
})
console.log(updateArias(dateList));
app.get('/the-progress-bar', async(req, res) => {
  res.render("progressbars", {location: 'The Progress Bar', bar: updateArias(dateList)});
});



app.get('/old-eggs', async(req, res) => {
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
  res.render("oldegggarden", {location: 'Old Egg Garden', eggs: eggList});
});



const potdslist = [
  { day: 'sep28', caption: 'September 28 -  Getting coffee before roadtrip to NYC!', src: '' },
  { day: 'sep27', caption: 'September 27 -  Anotha quarantine pic!', src: '' },
  { day: 'sep26', caption: 'September 26 -  Families collide!!!', src: '' },
  { day: 'sep25', caption: 'September 25 -  Us at Cheyenne\'s!!!', src: '' },
  { day: 'sep24', caption: 'September 24 -  Yodas in love!!!', src: '' },
  { day: 'sep23', caption: 'September 23 -  This is the skin of a killer Bella >:(!', src: '' },
  { day: 'sep22', caption: 'September 22 -  Dancin\' in Paris!', src: '' },
  { day: 'sep21', caption: 'September 21 -  Us at Disneyland Paris!', src: '' },
  { day: 'sep20', caption: 'September 20 -  You being an absolute dream!', src: '' },
  { day: 'sep19', caption: 'September 19 -  Us watching Luca!!!', src: '' },
  { day: 'sep18', caption: 'September 18 -  Could there be anything better than this?', src: '' },
  { day: 'sep17', caption: 'September 17 -  Good2Go Pizza Party in quarantine!!!', src: '' },
  { day: 'sep16', caption: 'September 16 -  Us post Hadestown, drifting off!', src: '' },
  { day: 'sep15', caption: 'September 15 -  Us havin\' a lil snack!', src: '' },
  { day: 'sep14', caption: 'September 14 -  Disney adults in love take on Ratatouille!', src: '' },
  { day: 'sep13', caption: 'September 13 -  Us in a phone booth w/ No1 Undesirable!', src: '' },
  { day: 'sep12', caption: 'September 12 -  Facemask in quarantine!', src: '' },
  { day: 'sep11', caption: 'September 11 -  Us at Coraline 15th bday!', src: '' },
  { day: 'sep10', caption: 'September 10 -  Family photo in quarantine!', src: '' },
  { day: 'sep9', caption: 'September 9 -  Stitches in love!', src: '' },
  { day: 'sep8', caption: 'September 8 -  Reunited!!!', src: '' },
  { day: 'aug26', caption: 'August 26 -  Us on the canals of Ammydam!', src: '' },
  { day: 'aug25', caption: 'August 25 -  Us at Margot\'s!', src: '' },
  { day: 'aug24', caption: 'August 24 -  Us hanging out at Bohan\'s!', src: '' },
  { day: 'aug23', caption: 'August 23 -  Dental hygeine in Amsterdam!', src: '' },
  { day: 'aug22', caption: 'August 22 -  Us toothbrushin\' at Margot\'s!', src: '' },
  { day: 'aug21', caption: 'August 21 -  Me being your hair stylist!', src: '' },
  { day: 'aug20', caption: 'August 20 -  Us on our way to Europe!!!', src: '' },
  { day: 'aug19', caption: 'August 19 -  Us at the Sleeping Beauty Castle!', src: '' },
  { day: 'aug18', caption: 'August 18 -  Us in the steamer at Margot\'s!', src: '' },
  { day: 'aug16', caption: 'August 16 -  Us at Gasworks Park!', src: '' },
  { day: 'aug15', caption: 'August 15 -  Harrowing Germany -> Paris Journey', src: '' },
  { day: 'aug14', caption: 'August 14 -  Us at Haidilao!', src: '' },
  { day: 'aug13', caption: 'August 13 -  Toothbrushin\' in Citizen M Amsterdam!', src: '' },
  { day: 'aug12', caption: 'August 12 -  Us on the train in Paris!', src: '' },
  { day: 'aug11', caption: 'August 11 -  Me and my Pirate Queen!', src: '' },
  { day: 'aug10', caption: 'August 10 -  Us looking absolutely sick in Amsterdam', src: '' },
  { day: 'aug9', caption: 'August 9 -  My gorgeous passenger princess O.O WOW', src: '' },
  { day: 'aug8', caption: 'August 8 - Parents lore type photo!', src: '' },
  { day: 'jul5', caption: 'July 5 - Us on a trip!', src: '' },
  { day: 'jul4', caption: 'July 4 - Caring for your base tan', src: '' },
  { day: 'jul3', caption: 'July 3 - Anotha toothbrushin\' pic feat. Prince Milo', src: '' },
  { day: 'jul2', caption: 'July 2 - Spoon-mirror dimension versions of ourselves', src: '' },
  { day: 'jul1', caption: 'July 1 - Sleepover at yours!', src: '' },
  { day: 'jun30', caption: 'June 30 - Us looking cute at the rendezvous!', src: '' },
  { day: 'jun29', caption: 'June 29 - My girlfriend getting eaten by a shark!!!', src: '' },
  { day: 'jun28', caption: 'June 28 - Copelia againnnn', src: '' },
  { day: 'jun27', caption: 'June 27 - You helping me pack ):( bittersweet', src: '' },
  { day: 'jun26', caption: 'June 26 - My version of heaven :)', src: '' },
  { day: 'jun25', caption: 'June 25 - Us on da ferry!', src: '' },
  { day: 'jun24', caption: 'June 24 - Me trying to devour you at pre-bday dinner!', src: '' },
  { day: 'jun23', caption: 'June 23 - Post sleep over in Hudson!', src: '' },
  { day: 'jun22', caption: 'June 22 - The first night I REALLY slept over', src: '' },
  { day: 'jun21', caption: 'June 21 - Pre-domestic violence at the Vermont house?!', src: '' },
  { day: 'jun20', caption: 'June 20 - Kissing at your pre-birthday dinner!', src: '' },
  { day: 'jun19', caption: 'June 19 - Us looking famous on your rooftop', src: '' },
  { day: 'jun18', caption: 'June 18 - On the subway back from Grad!', src: '' },
  { day: 'jun17', caption: "June 17 - Unlocking in at Jonny's", src: '' },
  { day: 'jun16', caption: 'June 16 - Crashing my Web Meeting with Milo', src: '' },
  { day: 'jun15', caption: 'June 15 - Copelia!', src: '' },
  { day: 'jun14', caption: "June 14 - Brunch after slumber at Bohan's!", src: '' },
  { day: 'jun13', caption: "June 13 - Teethbrushin' at the Hingham House!", src: '' },
  { day: 'jun12', caption: 'June 12 - Senior Formal!', src: '' }
].map((item, index) => ({
  ...item,
  src: '../images/potds/' + item.day + '.png',
  num: index+1
}));
const photoCount = " / " + String(potdslist[potdslist.length-1].num)
app.get('/photo-forest', (req, res) => {
  res.render("photoforest", {location: 'Photo Forest', potd: potdslist, photoCount: photoCount});
});



import cors from 'cors'
const corsOptions = {
  origin: '97.113.232.211', //https://benzoms.github.io
  optionsSuccessStatus: 200
};
app.get('/status',cors(corsOptions), (req, res) => {
  res.status(200).send({ "status": "200" })
});



app.get('/library', (req, res) => {
  res.render("library", {location: 'Library' });
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
    const newEggs = eggList.filter(egg => egg.eggnum > 24)
    res.render("egggarden", {location: 'Egg Garden', eggs: newEggs});
  });

let froglimit = new Date(0);
let bearlimit = new Date(0);

function checkLimit(lim) {
  const now = new Date();
  if (now < lim) {
    const timeDifference = lim - now;
    const minutes = Math.floor(timeDifference / 60000);
    const seconds = ((timeDifference % 60000) / 1000).toFixed(0);
    return `I am still resting. Return in ${minutes} minutes and ${seconds} seconds.`;
  } else {  return 'okay';  }
}
function setNewLimit() {
  const now = new Date();
  return new Date(now.getTime() + 10 * 60000); //30 * 60000 30 min
}

app.get('/song-swamp', (req, res) => {
  let cl = checkLimit(froglimit);
  console.log(cl);
  console.log(typeof cl);
  console.log(froglimit);
  if (cl != 'okay') {
    res.render("songswamp", { location: 'Song Swamp', frogadvice: (String(cl) + '\n').split('\n'), frogresting: true });
  } else {
    res.render("songswamp", { location: 'Song Swamp', frogadvice: 'Welcome to my new home! Doth thou require guidance?\n'.split('\n') });
  }
});

let recentFrogAdvice = 'Welcome to my new home! Doth thou require guidance?\n';
app.get('/frog-result', (req, res) => {
  let cl = checkLimit(froglimit);
  console.log(cl);
  console.log(typeof cl);
  console.log(froglimit);
  if (cl != 'okay') {
    res.render("songswamp", { location: 'Song Swamp', frogadvice: ([recentFrogAdvice, (String(cl) + '\n')].join('\n')).split('\n'), frogresting: true });
  } else {
    res.render("songswamp", { location: 'Song Swamp', frogadvice: recentFrogAdvice.split('\n') });
  }
});

import OpenAI from 'openai'
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
app.post('/sage-advice', async (req, res) => {
  if (checkLimit(froglimit) == 'okay') {
    if (!req.body.topic) {
      res.render('photoforest', { frogadvice: 'Somethin wrong come back later\n' });
    } else {
      const prompt = "Be brief and chosen with your words, speak like a learned philosopher and wizard. Give me advice on this: " + req.body.topic;
      const completion = await openai.chat.completions.create({
        "model": "gpt-3.5-turbo",
        "messages": [
          {
            "role": "system",
            "content": "Deep within the enchanted Photo Forest, you live in a cozy burrow beneath an ancient tree. You spend your days in quiet contemplation and studying ancient tomes, delighting in visits from travelers and adventurers. Offering sage advice and a warm cup of herbal tea, you guide visitors with simple yet profound wisdom. The grateful forest creatures ensure your life is rich in nature's joys and appreciation from those you help. You are a mystical frog tasked with giving advice. You will be given a topic on which you should give wise, sage, advice (if possible use a frog metaphor). In all your responses, say *ribbit* occasionally and intersperse frog puns whenever possible. After your advice, make sure to mention how tired you are at that you need to 10 minutes to rest and recharge your wisdom giving abilities. At the beginning of your response, quickly mention to remember to where sunscreen today.."
          },
          {
            "role": "user",
            "content": prompt
          }
        ]
      })
      console.log(completion.choices[0].message);
      recentFrogAdvice = completion.choices[0].message.content;
      froglimit = setNewLimit();
      res.redirect('/frog-result')
      //res.render('photoforest', {frogadvice:completion.choices[0].message.content.split('\n'), frogresting:true});
    }
  } else {
    res.redirect('/song-swamp');
  }
});

app.get('/mamabear', (req, res) => {
  let cl = checkLimit(bearlimit);
  console.log(cl);
  console.log(typeof cl);
  console.log(bearlimit);
  if(cl != 'okay'){
    res.render("mamabear", {frogadvice:(String(cl)+'\n').split('\n'), frogresting:true});
  }else{
    res.render("mamabear", {frogadvice:'How may I guide you today, Julia?\n'.split('\n')});
  }
});
let recentBearAdvice = 'How may I guide you today, Julia?\n';
app.get('/bear-result', (req, res) => {
  let cl = checkLimit(bearlimit);
  console.log(cl);
  console.log(typeof cl);
  console.log(bearlimit);
  if (cl != 'okay') {
    res.render("mamabear", { frogadvice: ([recentBearAdvice, (String(cl) + '\n')].join('\n')).split('\n'), frogresting: true });
  } else {
    res.render("mamabear", { frogadvice: recentBearAdvice.split('\n') });
  }
});
app.post('/sage-advice2', async(req, res) => {
  if(checkLimit(bearlimit)=='okay'){
    
  if(!req.body.topic){
    res.render('mamabear', {frogadvice:'Somethin wrong come back later\n'});
  }else{
    
    const prompt = "Be brief and chosen with your words, speak like a learned philosopher and caring mother. Give me advice on this: " +req.body.topic;
    const completion = await openai.chat.completions.create({
      "model": "gpt-3.5-turbo",
      "messages": [
        {
          "role": "system",
          "content": "You are Momo the bear, a mama bear tasked with giving another mama bear advice. Your traits are kind, caring, generous, maternal, fierce, strong-willed, and judicious. You will be given a topic on which you should give advice (if possible use a bear or forest metaphor). In all your responses, say *hmph* occasionally and intersperse bear,honey, or cub puns whenever possible. After your advice, make sure to mention how tired you are at that you need to 10 minutes to rest and recharge your wisdom giving abilities."
        },
        {
          "role": "user",
          "content": prompt
        }
      ]
    })
    console.log(completion.choices[0].message);
    recentBearAdvice = completion.choices[0].message.content;
    bearlimit = setNewLimit();
    res.redirect('/bear-result')
  }
  }else{
    res.redirect('/mamabear');
  }
  
  
})
app.post('/sage-advice3', async(req, res) => {
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