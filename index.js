var express = require('express')
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser')
const cors = require('cors')
const admin = require('firebase-admin');
require('dotenv').config()


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.am1je.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

var app = express()





app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())



var serviceAccount = require("./configs/buj-al-arib-firebase-adminsdk-hhsxb-b7e1643d25.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),  
 
});


app.get('/', function (req, res) {
  res.send('hello world')
})


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const collection = client.db("databasebuj").collection("bujdata");
  app.post('/addBooking',(req,res)=>{
      const newBooking=req.body;
      collection.insertOne(newBooking)
      .then(result=>{
          res.send(result.insertedCount>0)
      })
  })
  
  app.get('/bookings',(req,res)=>{
    
    const bearer= req.headers.authorization

    if(bearer && bearer.startsWith('Bearer ')){
      const idToken=bearer.split(' ')[1];
      console.log({idToken})
      admin
     .auth()
     .verifyIdToken(idToken)
     .then((decodedToken) => {
      const tokenEmail = decodedToken.email;
      if(tokenEmail===req.query.email){
        collection.find({email: req.query.email })
        .toArray((err,documents)=>{
            res.send(documents)
        })
      }
     })
    .catch((error) => {
      res.status(401).send('un authorization exixs')
     });
    }



    // console.log(req.headers.authorization)
    //   collection.find({email: req.query.email })
    //   .toArray((err,documents)=>{
    //       res.send(documents)
    //   })


    else{
      res.status(401).send('un authorization exixs')
    }
  })

});



app.listen(process.env.PORT|| 5000)