const express = require("express");
const app = express();
const PORT = 8080;

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

let urlDatabase = {
	"b2xVn2": "http://www.lighthouselabs.ca",
	"9sm5xK": "http://google.com"
};

app.get("/u/:shortURL", (req, res) =>{
	let shortURL = req.params.shortURL;
	res.redirect(urlDatabase[shortURL]);
})

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

app.post("/urls", (req, res) => {
	let random = generateRandomString();
	urlDatabase[random] = req.body.longURL;
	res.redirect('/urls/' + random);
});


app.listen(PORT, () => {
	console.log(`Example app listening on port ${PORT}!`);
})

function generateRandomString(){
	let randomString = '';
	let symbols = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
	for( let i = 0; i < 6; i++){
		randomString += symbols.charAt(Math.floor(Math.random() * symbols.length));
	} 
	return randomString;
};