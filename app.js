var express = require('express');
var bodyParser = require('body-parser');
var query       = require('./query');

var connectionString = process.env.DATABASE_URL || 'postgres://' + process.env.POSTGRES_USER + ':' + process.env.POSTGRES_PASSWORD + '@localhost/calendar' ;

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));

app.get("/", function(req, res){
  res.render('index');
});

app.post("/addEvent", function(req, res){
    query(`insert into events(title, description, start_date) values('${req.body.title.replace("'","''")}', '${req.body.description.replace("'","''")}', '${req.body.start}') returning id as last_id`, function(err, result){
        if(err){
          console.log(err);
        }
        else{
          res.send({event: result.rows[0]});
        }
    });

});

app.get("/event/:id", function(req, res){
  console.log("yeet");
  query('select * from events where id=$1',[req.params.id],function(err, result){
      res.render('event',{event: result.rows[0]});
  });
});

app.get("/login", function(req, res){
  res.render('login');
});

app.post("/login", function(req, res){
  query(`select * from users where username =$1 and password =$2`,['${req.body.username}', '${req.body.password}'], function(err, result){
    if(err){
      res.send(err);
    }
    else{
      res.send("found user!");
    }
  });
});

app.get('/events', function(req, res){
  query(`select * from events`, function(err, result){
    if(err){
      res.send(err);
    }
    else{
      res.send({events: result.rows});
    }
  });
});
app.get('/events/:start', function(req, res){
  var start = req.params.start;
  console.log(start);
  query(`select * from events where start_date='${req.params.start}' `,function(err, result){
    if(err){
      console.log("error finding the user");
      res.send(err);
    }
      else{
        res.send({events: result.rows});
    }

  });


});

app.listen(process.env.PORT || 3000,function(){
  console.log("listening on port 3000");
});
