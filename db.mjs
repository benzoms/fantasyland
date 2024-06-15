import './config.mjs';
import mongoose from 'mongoose';
//mongoose.connect('mongodb://localhost/mydb')


// define the data in our collection

const EggSchema = new mongoose.Schema({
    eggnum: Number,
    spotcolor: String,
	scale: Number,
    xPos: Number,
    yPos: Number,
    animationTime: Number,
    message: String,
    createdAt: Date
});



// "register" it so that mongoose knows about it
mongoose.model('Egg', EggSchema);
// mongoose.model('Post', PostSchema);

mongoose.connect(process.env.DSN);

//const testReview = mongoose.model("Review")

//const c = await testReview.findOne()



//console.log(c)