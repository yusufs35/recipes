const mysql = require("mysql");
const bodyParser = require("body-parser");
const express = require("express");
const cookieParser = require('cookie-parser');

const app = express();
app.use(bodyParser.urlencoded({
    extended: true
}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());
app.use(cookieParser());

var connection = mysql.createConnection({
    multipleStatements: true,
    host: 'localhost',
    user: 'root',
    password: 'Ax17*.c*',
    database: 'recipes'
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("MYSQL'e bağlandı..");
}); -

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

                    

               });
         }


         
         console.log(results[4]);
         res.render("recipe-detail", {
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
     var sql = "BURAYA SQL GELCEK";

    connection.query(sql, function (err, results, fields) {

        if (err) throw err;
        res.render("search", {
            searchResults: results
        })

    });

});

app.listen("9000");
