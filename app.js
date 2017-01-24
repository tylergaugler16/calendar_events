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


app.listen(3000,function(){
  console.log("listening on port 3000");
});
