const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080;

// users[req.cookies.userid]
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  },
  "user3RandomID": {
  	id: "user3RandomID",
  	email: "zhumagaliyev.chingiz@gmail.com",
  	password: "123"
  }
}

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

app.use(cookieParser());
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
			username: req.cookies["user"]
		};
	}
	res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
	let templateVars = {
		username: req.cookies["user"]
	};
	res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
	let templateVars = {
		shortURL: req.params.id,
		longURL: urlDatabase[req.params.id],
		username: req.cookies["user"]
		//user = users[id]
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
	let templateVars;
	if(req.cookies){
			templateVars = {
			shortURL: req.params.id,
			longURL: urlDatabase[req.params.id],
			username: req.cookies["user"]
		}
	} else{
	 	templateVars = {
			shortURL: req.params.id,
			longURL: urlDatabase[req.params.id],
			username: null
		}
		
	}
	res.render("urls_register",templateVars);
});

// login post and get-------------------------------------------

app.get("/login", (req, res) => {
	let templateVars = {
		username: req.cookies["user"],
		email: req.body.email
	}
	res.render("login", templateVars);
})

app.post("/login", (req, res) =>{
	let email = req.body.email;
	let password = req.body.password;

	if( password === '' || email === ''){
		res.send("Please, enter the email and password.")
	} else {
		//check for the user email and password

		for(let user in users){
			if(users[user].password === password && users[user].email === email){
				let email = {
					username: req.cookies["user"],
					email: req.body.email
				}
				res.cookie("user", user);
				res.redirect("/urls");
				return;
			}
		}
		res.status(403);
		res.send("Wrong email or password. Please, try again")
	}
	
});

// -------------------------------------------------------------
// Hello page

app.get("/hello", (req, res) =>{
	res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// -------------------------------------------------------------

// same as this, but no
app.post("/urls", (req, res) => {
	let random = generateRandomString();
	urlDatabase[random] = req.body.longURL;
	res.redirect('/urls/' + random);
});
// res.status(400).send("not found")
// app.post("/register", (req, res) => {
// 	res.redirect("/urls")
// });
function checkEmail(email){
	for(var key in users){
		if(email === users[key].email){
			return true;
		}
	}
	return false;
};

app.post("/register", (req, res) =>{
	//Validation that the Email and password should be present
	if(!req.body.email || !req.body.password){
		res.status(400).send("Please enter email and password");
	}
	//Validation if the email is already registered
	if(!checkEmail(req.body.email)){
		let randomId = generateRandomString();
		let usersId = {
			id: randomId,
			email: req.body.email,
			password: req.body.password
		}
		users[randomId] = usersId;
		res.cookie("users_id", usersId.id);
		res.redirect("/urls");
	} else {
		res.status(400).send("Email already registered");
		res.redirect("/register");
	}
	
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
	res.cookie('user', req.body.user);
	res.redirect('/urls');
});

app.post("/logout", (req, res) => {
	res.clearCookie('user', req.body.user);
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

