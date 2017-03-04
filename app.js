var express     = require('express');
var bodyParser  = require('body-parser');
var query       = require('./query');
var bcrypt      = require('bcrypt');
var session = require('express-session');
var passport    = require('passport');
var randomstring = require('randomstring');

var FacebookStrategy = require('passport-facebook').Strategy;
var config = require('./oauth');

var env = process.env.NODE_ENV || 'dev';

// var connectionString = process.env.DATABASE_URL || 'postgres://' + process.env.POSTGRES_USER + ':' + process.env.POSTGRES_PASSWORD + '@localhost/calendar' ;



var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));


var sess = {
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: {}
};
var callback_url = 'http://localhost:3000/auth/facebook/callback';
var client_id = config.facebook.clientID;
var client_secret = config.facebook.clientSecret;
if(env == 'production'){
  callback_url = 'https://weatherevent-calendar.herokuapp.com/auth/facebook/callback';
  client_id = config.facebook_production.clientID;
  client_secret = config.facebook_production.clientSecret;
  secure = true;
  app.set('trust proxy', 1);
  sess.cookie.secure = true;
}

app.use(session(sess));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
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
    clientID: client_id,
    clientSecret: client_secret,
    callbackURL: callback_url,
    // profileFields: ['id', 'displayName', 'link', 'about_me', 'photos', 'emails']
  },
  function(accessToken, refreshToken, profile, cb) {
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
  var user_calendars = {};
  calendars = [];
  user_calendars.calendars = calendars;
  query(`select * from calendars where user_id=${req.user.id}`, function(err, result){
    if(result.rowCount > 0){
      res.render('index', {user: req.user, calendars: result.rows});
      // for(var i=0;i<result.rows.length;i++){
      //   user_calendars.calendars[i] = {
      //     name: result.rows[i].name,
      //     id: result.rows[i].id
      //     };
      //   }

      }
      else res.render('index', {user: req.user, calendar: []});


    });

});


app.post("/addEvent", function(req, res){
    query(`insert into events(title, description, start_date, calendar_id) values('${req.body.title.replace("'","''")}', '${req.body.description.replace("'","''")}', '${req.body.start}', '${req.body.calendar_id}' ) returning id as last_id`, function(err, result){
        if(err){
          console.log(err);
        }
        else{
          res.send({event: result.rows[0]});
        }
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

app.get('/auth/facebook', passport.authenticate('facebook'),function(req, res){
  console.log("/AUTH/FACEBOOK");
});
app.get('/auth/facebook/new', passport.authenticate('facebook', {authType: 'reauthenticate'}),function(req, res){
  console.log("/AUTH/FACEBOOK");
});

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login'}),
  function(req, res) {
    console.log("CALLBACK");
    console.log(req.user.displayName);
    // Successful authentication, redirect home.
    res.redirect('/');
  });



app.get('/events', function(req, res){
  // get all events associated with calendar
console.log(req.query.name);
  if(req.query.password !== null && req.query.name !== null){
    console.log("yeet");
    console.log(req.query.password);
    query(`select * from events where calendar_id in (select id from calendars where password='${req.query.password}')`, function(err, events){
      console.log(events.rows[0]);
      if(err){
        res.send(err);
      }
      else{
        console.log(req.query.password);
        query(`select * from users where id in (select user_id from calendars where password='${req.query.password}' and name ='${req.query.name}') `, function(err, result){
          if(err){console.log(err);}
          else{
            res.send({events: events.rows, users: result.rows});
          }
        });
      }
    });

  }

  // get all user_ids assocaited with calendar

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


app.post('/calendar/add', function(req, res){
  password = randomstring.generate(10);
  query(`insert into calendars(name, user_id,password) values('${req.body.name.replace("'","''")}',${req.body.user_id}, '${password}' ) returning id as last_id`, function(err, result){
      if(err){
        console.log(err);
      }
      else{
        res.send({user_id: result.rows[0].last_id, password: password});
      }
  });

});

app.post('/calendar/join', function(req, res){
  query(`select name from calendars where password ='${req.body.password}'`, function(err, result){
    if(err){
      console.log(err);
      res.sendStatus(404);
    }
    else if(result.rowCount > 0){
      name = result.rows[0].name;
    query(`insert into calendars(name, user_id, password) svalues('${name}','${req.body.user_id}','${req.body.password}') returning id as last_id`, function(err, result){
        if(err){
          console.log(err);
        }
        else{
          res.send({user_id: result.rows[0].last_id, name: name});
        }
      });
    }
    else{
      res.sendStatus(404);
    }
  });
});

app.post('/calendar/delete', function(req, res){
  query(`delete from events where calendar_id='${req.body.id}'`, function(err, result){
    if(err){
      console.log(err);
    }
    else{
      query(`delete from calendars where id = '${req.body.id}'`, function(err, result){
        if(err){
          console.log(err);
          res.sendStatus(404);
        }
        else{
          res.sendStatus(200);
        }
      });
    }
  });
});

app.post('/event/comment/add', function(req, res){
  query(`insert into event_comments(user_id, comment, date, event_id, username) values(
    '${req.body.user_id}', '${req.body.comment}', '${req.body.date}', '${req.body.event_id}', '${req.body.username}')`,
    function(err, result){
      if(err){
        console.log(err);
        res.sendStatus(404);
      }
      else{
        res.sendStatus(200);
      }
    });
});

app.get('/event/comments', function(req, res){
  query(`select * from event_comments where event_id= '${req.query.event_id}'`, function(err, result){
    if(err){
      console.log(err);
      res.sendStatus(404);
    }
    else{
      res.send({comments: result.rows});
    }
  });
});
app.get("/event/:id", function(req, res){
  console.log("yeet");
  query('select * from events where id=$1',[req.params.id],function(err, result){
      res.render('event',{event: result.rows[0]});
  });
});




app.listen(process.env.PORT || 3000,function(){
  console.log("listening on port 3000");
});

setInterval(sessionCleanup, 24 * 60 * 60 * 1000);

function sessionCleanup() {
    sessionStore.all(function(err, sessions) {
        for (var i = 0; i < sessions.length; i++) {
            sessionStore.get(sessions[i], function() {} );
        }
    });
}
