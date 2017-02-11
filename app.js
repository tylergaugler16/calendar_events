var express     = require('express');
var bodyParser  = require('body-parser');
var query       = require('./query');
var bcrypt      = require('bcrypt');
var session = require('express-session');
var passport    = require('passport');

var FacebookStrategy = require('passport-facebook').Strategy;
var config = require('./oauth');

var env = process.env.NODE_ENV || 'dev';
var connectionString = process.env.DATABASE_URL || 'postgres://' + process.env.POSTGRES_USER + ':' + process.env.POSTGRES_PASSWORD + '@localhost/calendar' ;
var callback_url = 'http://localhost:3000/auth/facebook/callback';
if(env == 'production'){
  callback_url = 'https://weatherevent-calendar.herokuapp.com/auth/facebook/callback';
}

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));



app.set('trust proxy', 1);
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: (env == 'production')} // set secure to true if in production. for https
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  // console.log("serializing"+user.displayName );
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  console.log("trying to deserialize "+id);
  query(`select * from users where facebook_id='${id}'`, function(err, result){
    if(result.rowCount === 0){
      console.log("could not find user with given id");
    }
    else{
      console.log(result.rows[0].username);
      done(null, result.rows[0]);
    }
  });
});




passport.use(new FacebookStrategy({
    clientID: '270076200092678',
    clientSecret: '651dbeef72caf9f1dac8689bef645cad',
    callbackURL: callback_url,
    auth_type: "reauthenticate"
    // profileFields: ['id', 'displayName', 'link', 'about_me', 'photos', 'emails']
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
    query(`select * from users where facebook_id='${profile.id}'`, function(err, result){
      var user = result;
      if( result.rowCount === 0 ){
        query(`insert into users(username, facebook_id, access_token) values('${profile.displayName}','${profile.id}','${accessToken}')`, function(err,result){
          user = result;
          // if(!err){ var user = result.rows[0];}
          // else{console.log(err);}
        });
      }
        else{

        }

    });

    // mainly for just getting users accessToken? save in db
    cb(null, profile);
  }
));

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect("/login");
    // res.sendStatus(401);
}
// example how to use isLoggedIn
// app.get("/", isLoggedIn function(req, res){
//   console.log(req.user);
//
//   res.render('index', {user: req.user});
// });


app.get("/", isLoggedIn, function(req, res){
  res.render('index', {user: req.user});
});


app.post("/addEvent", function(req, res){
    query(`insert into events(title, description, start_date, user_id) values('${req.body.title.replace("'","''")}', '${req.body.description.replace("'","''")}', '${req.body.start}', ${req.body.user_id} ) returning id as last_id`, function(err, result){
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
  bcrypt.hash(req.body.password, 10, function(){
    if(err){
      res.redirect('/login');
    }
    query(`select * from users where username =$1 and password =$2`,['${req.body.username}', hash], function(err, result){
      if(err){
        res.send(err);
      }
      else{
        res.send("found user!");
      }
    });

  });

});
app.get('/logout', function (req, res){
  res.clearCookie("user");
  req.logout();
  res.redirect('/');
});

app.get('/auth/facebook', passport.authenticate('facebook', {authType: 'reauthenticate'}),function(req, res){
  console.log("/AUTH/FACEBOOK");
});

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', {authType: 'reauthenticate', failureRedirect: '/login'}),
  function(req, res) {
    console.log("CALLBACK");
    console.log(req.user.displayName);
    // Successful authentication, redirect home.
    res.redirect('/');
  });



app.get('/events', function(req, res){
  query(`select * from events where user_id='${req.user.id}'`, function(err, result){
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

app.get('/events/delete/:id', function(req, res){
  query(`delete from events where id=$1`,[req.params.id], function(err,result){
    if(err) console.log(err);
    res.redirect("/");
  });
});

app.listen(process.env.PORT || 3000,function(){
  console.log("listening on port 3000");
});
