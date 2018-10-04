const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080;
const username = '';

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");
// req is object and params key
let urlDatabase = {
	"b2xVn2": "http://www.lighthouselabs.ca",
	"9sm5xK": "http://google.com"
};

// redirect ot the webside using shortURL
app.get("/u/:shortURL", (req, res) =>{
	let shortURL = req.params.shortURL;
	res.redirect(urlDatabase[shortURL]);
});


app.get("/urls", (req, res) => {
	let templateVars = { urls: urlDatabase};
	res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
	res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
	let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id]};
	res.render("urls_show", templateVars);
});

app.get("/", (req, res) => {
	res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
	res.json(urlDatabase);
});

app.get("/hello", (req, res) =>{
	res.send("<html><body>Hello <b>World</b></body></html>\n");
});
// same as this, but no
app.post("/urls", (req, res) => {
	let random = generateRandomString();
	urlDatabase[random] = req.body.longURL;
	res.redirect('/urls/' + random);
});


// delete short URL list
app.post("/urls/:id/delete", (req, res) => {
	delete urlDatabase[req.params.id];
	let templateVars = { urls: urlDatabase};
	res.redirect("/urls");
});

// new URl and replace 
app.post("/urls/:id", (req, res) => {
	// shortURL = newLongURL
	console.log(urlDatabase);
	urlDatabase[req.params.id] = req.body.longURL;
	res.redirect("/urls");
});

// app.post("/urls/login", (req, res) => {
	
// })


// Console log for a running server
app.listen(PORT, () => {
	console.log(`Example app listening on port ${PORT}!`);
})

// Random number for shortURL
function generateRandomString(){
	let randomString = '';
	let symbols = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
	for( let i = 0; i < 6; i++){
		randomString += symbols.charAt(Math.floor(Math.random() * symbols.length));
	} 
	return randomString;
};