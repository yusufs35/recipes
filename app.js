//npm i passport passport-local express-session bcrypt

const mysql = require("mysql");
const bodyParser = require("body-parser");
const express = require("express");
const cookieParser = require('cookie-parser');

const session = require('express-session');
const passport = require('passport');
const passportLocal = require('passport-local');
const bcrypt = require('bcrypt');


const app = express();
app.use(bodyParser.urlencoded({
    extended: true
}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());
app.use(cookieParser());

var LocalStrategy = passportLocal.Strategy;

var connection = mysql.createConnection({
    multipleStatements: true,
    host: 'localhost',
    user: 'root',
    password: '12344321',
    database: 'recipes'
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("MYSQL'e bağlandı..");
}); 

passport.use('local-login', 
     new LocalStrategy({
          usernameField : 'email',
          passwordField: 'password',
          passReqToCallback: true
     },
     function(req, email, password, done){
          connection.query("SELECT * FROM users WHERE email=?", [email], function(err, rows){
               if(err) return done(null, {msg: err});
               if(rows.length<=0) return done(null, {msg: "kullanıcı bulunamadı"});
               if(!bcrypt.compareSync(password, rows[0].password )) return done(null, {msg: "şifre yanlış"});
               if(rows[0].type != "admin") return done(null, {msg:"Admin değilsin"});

               return done(rows[0], null);

          });
     }));


passport.serializeUser(function(user, done){
     done(null, user.user_id);
});

passport.deserializeUser(function(id, done){
     connection.query("SELECT * FROM users WHERE user_id = ?", [id], function(err, rows){
          done(err, rows[0]);
     });
});

app.use(session({
     secret: 'sjkhfsjkhfdjkshdjfjsklşwkerlşw',
     resave: true,
     saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());


app.get("/", function (req, res) {
    var sql = "SELECT * FROM banners WHERE visible=1 ORDER BY seq;" +
    " SELECT recipes.*, ( SELECT ROUND(AVG(rating)) rating FROM comments GROUP BY recipe HAVING recipe = recipes.recipe_id ) rating  FROM recipes     WHERE recipes.visible=1 ORDER BY recipes.create_date DESC limit 9;"+
    "SELECT * FROM recipes  WHERE visible=1 ORDER BY read_score DESC LIMIT 3;"+
    "SELECT * FROM categories ORDER BY title;";
    connection.query(sql, function (err, results, fields) {

        if (err) throw err;
        res.render("index", {
            slider: results[0],
            recipes:results[1],
            popular: results[2],
            categories: results[3]
        })

    });

});

app.get("/tarifler/:tarif", function (req, res) {
  var tarif = req.params.tarif;
    var sql = "SELECT * FROM recipes WHERE recipe_id="+tarif+";"+
    "SELECT * FROM ingredients WHERE recipe="+tarif+ ";"+
    "SELECT * FROM directions WHERE recipe="+tarif+ ";" +
    "SELECT * FROM comments WHERE recipe="+tarif + ";"+
    "SELECT ROUND(AVG(rating)) rating FROM comments GROUP BY recipe HAVING recipe="+tarif+ ";"+
    "SELECT * FROM recipes  WHERE visible=1 ORDER BY read_score DESC LIMIT 3;"+
    "SELECT * FROM categories ORDER BY title;"+
    "SELECT * FROM recipes ORDER BY RAND() LIMIT 3;";

    connection.query(sql,  function (err, results, fields) {

        if (err) throw err;

          if(!req.cookies.tarif){

               res.cookie('tarif', 'abc', {
                    expires: new Date(Date.now() + 1000 * 60 * 60 * 24)
               })


               sql = "UPDATE recipes SET read_score = read_score + 1 WHERE recipe_id = " + tarif;
               connection.query(sql, function (err, results, fields) {
                    if(err) throw err;

<<<<<<< HEAD


               });
          }



         console.log(results[4]);
         res.render("recipe-detail", {
=======
               });
          }

          console.log(results[4]);
          res.render("recipe-detail", {
>>>>>>> master
              recipe: results[0],
              ingredients:results[1],
              directions:results[2],
              comments:results[3],
              rating : results[4],
              popular: results[5],
              categories: results[6],
              randomRecipes: results[7]
         })

    });

});

app.post('/add-comment', function(req, res){
     console.log(req.body);
     var sql = "INSERT INTO comments(comment, create_date, rating, name, email, visible, recipe) VALUES('" + req.body.comment + "',CURDATE()," + req.body.rate + ",'" + req.body.name + "','" + req.body.email + "',1," + req.body.recipe + ");"

     connection.query(sql, function (err, results, fields) {

          if (err) throw err;
          res.redirect('/tarifler/' + req.body.recipe);

      });
});

app.get("/search/:cat/:text", function(req, res){
     // search/4/0     SELECT * FROM recipes WHERE category = 4 AND  1=1
     // search/0/al    SELECT * FROM recipes WHERE title LIKE '%al%' AND 1=1
     // search/5/al    SELECT * FROM recipes WHERE categroy=5 AND title LIKE '%al%' AND 1=1
     var params = [];
     var sql = "SELECT * FROM recipes WHERE ";

     if(req.params.cat!="0"){
          sql += "category = ? AND ";
          params.push(req.params.cat);
     }

     if(req.params.text!="0"){
          sql +=  "title LIKE ? AND";
          params.push("%" + req.params.text + "%");
     }

     sql += " 1=1;";
     sql += "SELECT * FROM categories ORDER BY title;";
    


    connection.query(sql, params, function (err, results, fields) {

        if (err) throw err;
        res.render("search", {
            searchResults: results[0],
            categories: results[1],
            activeCategory: req.params.cat,
            searchText: req.params.text
        })
    });

});

app.get("/login", function(req, res){
     res.render("login");
});

app.post("/login", function(req, res){
     passport.authenticate('local-login', function(user, msg){
          if(msg){
               res.render('login', msg);
          }
          else{
               req.logIn(user, function(err){
                    if(err) throw err;
                    return res.redirect('/admin');
               });
          }
     })(req,res)
});

app.get('/admin/logout', isLoggedIn, function(req, res){
     req.logout();
     res.redirect('/');
});


app.get("/admin/category/:id?", isLoggedIn, function(req, res){
     res.render("admin-category");
});

app.get("/admin", isLoggedIn,  function(req, res){
     res.render("admin-index");
});


app.listen("9000");



function isLoggedIn(req, res, next){
     if(req.isAuthenticated()){
          return next();
     }
     res.redirect('/login');
}
