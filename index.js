require('dotenv').config();
const dns = require('dns');
const express = require('express');
const cors = require('cors');
const { url } = require('inspector');
const app = express();

//require bodyParser middleware to access document body
const bodyParser = require('body-parser');



// Basic Configuration
const port = process.env.PORT || 3000;

//mount middleware
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

//Url Arr to store urls
let urlArr = ['placeholder'];

//regex to clean url
const regEx = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;

//regex to check shorturl parameter
const numRegEx = /\D/gm;

app.post('/api/shorturl', (req, res)=>{
  //get submitted url on POST req
  let url = String(req.body.url);
  console.log(url);

  if(!regEx.test(url)){
    return res.json({ error: 'invalid url' })
  }

  //clean and check provided url:
  dns.lookup(url.replace(regEx, ''), {all: true}, (err,data)=>{
    if (err){ 
      return res.json({ error: 'invalid url' })
    }else{
      urlArr.push(url);
      res.json({ original_url : url, short_url : (urlArr.indexOf(url))});
    }
  })
})

app.get('/api/shorturl/:num', (req, res)=>{
  let {num} = req.params;
  num = Number(num);
  if (numRegEx.test(num) || num == 0){
    res.json({error: "Wrong format"});
  }else{
    let getUrl = urlArr[num];
    if(getUrl == undefined){
      res.json({"error": "No short URL found for the given input"});
    }else{
      res.redirect(getUrl);
    }
  }

})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
