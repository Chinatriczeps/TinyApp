const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080;

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

app.use(cookieParser());
// req is object and params key
let urlDatabase = {
	"b2xVn2": "http://www.lighthouselabs.ca",
	"9sm5xK": "http://google.com"
};

// redirect to the webside using shortURL
app.get("/u/:shortURL", (req, res) =>{
	let shortURL = req.params.shortURL;
	res.redirect(urlDatabase[shortURL]);
});


app.get("/urls", (req, res) => {
	let templateVars;
	if(!req.cookies){
		templateVars = {
			urls: urlDatabase,
			username: ""
		};
	} else {
		templateVars = {
			urls: urlDatabase,
			username: req.cookies["username"]
		};
	}
	res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
	let templateVars = {
		username: req.cookies["username"]
	};
	res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
	let templateVars = {
		shortURL: req.params.id,
		longURL: urlDatabase[req.params.id],
		username: req.cookies["username"]
	};
	res.render("urls_show", templateVars);
});

app.get("/", (req, res) => {
	res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
	res.json(urlDatabase);
});

app.get("/register", (req, res) => {
	let templateVars = {
		shortURL: req.params.id,
		longURL: urlDatabase[req.params.id],
		username: req.cookies["username"]
	}
	res.render("urls_register");
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

app.post("/register", (req, res) => {
	res.redirect("/urls")
});


// delete short URL list
app.post("/urls/:id/delete", (req, res) => {
	delete urlDatabase[req.params.id];
	res.redirect("/urls");
});

// new URl and replace 
app.post("/urls/:id", (req, res) => {
	// shortURL = newLongURL
	urlDatabase[req.params.id] = req.body.longURL;
	res.redirect("/urls");
});

app.post("/login", (req, res) => {
	res.cookie('username', req.body.username);
	res.redirect('/urls');
});

app.post("/logout", (req, res) => {
	res.clearCookie('username', req.body.username);
	res.redirect('/urls')
});


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

