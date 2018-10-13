// all needed variables
const express = require('express');
const app = express();
const PORT = 8080;
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');


app.use(bodyParser.urlencoded({
    extended: true
}));

app.set('view engine', 'ejs');

app.use(cookieSession({
    keys: ['something-secret'],
    name: 'session'
}));

// function for generating random 6 character string-----------------------------------------
function generateRandomString(){
	let randomString = '';
	let symbols = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
	for( let i = 0; i < 6; i++){
		randomString += symbols.charAt(Math.floor(Math.random() * symbols.length));
	} 
	return randomString;
};


// DataBases--------------------------------------------------------------------------------------------
const urlDatabase = {
    'b2xVn2': {
        longURL: 'http://www.lighthouselabs.ca',
        userId: 'user1RandomId'
    },
    '9sm5xK': {
        longURL: 'http://www.google.com',
        userId: 'user2RandomId'
    }
};

const userDatabase = {
    'user1RandomId': {
        userId: 'user1RandomId',
        email: 'user@example.com',
        password: bcrypt.hashSync('purple-monkey-dinosaur', 10)
    },
    'user2RandomId': {
        userId: 'user2RandomId',
        email: 'user2@example.com',
        password: bcrypt.hashSync('dishwasher-funk', 10)
    },
    'user3RandomId': {
    	userId: 'user3RandomId',
    	email: 'zhumagaliyev.chingiz@gmail.com',
    	password: bcrypt.hashSync('123', 10)
    }
};

// All get requests--------------------------------------------------------------------------------------------

app.get('/urls', (req, res) => {
    let userId = req.session.userId
    if (userId) {
        let uniqueId = (usersUrls(userId));
        let templateVars = {
            urls: uniqueId,
            user: userDatabase[userId]
        };
        res.render('urls_index', templateVars);
    } else {
        res.send(`Before accesing this page login or register`);
    }
});

app.get('/urls/new', (req, res) => {
    let userId = req.session.userId
    let templateVars = {
        user: userDatabase[userId],
    };
    if (userId) {
        res.render('urls_new', templateVars);
    } else {
        res.send('You should be logged in to be able to make a new URLs')
        res.redirect('/login');
    }
});

app.get('/urls/:id', (req, res) => {
    let userId = req.session.userId;
    let uniqueId = (usersUrls(userId));
    if (uniqueId[req.params.id] === undefined) {
        res.send('To be able to see this page, log in!');
    } 
    if (userId) {
        let templateVars = {
            shortURL: req.params.id,
            urls: uniqueId,
            longURL: uniqueId[req.params.id].longURL,
            user: userDatabase[userId],
        };
        res.render('urls_show', templateVars);
    } else {
        res.send('TO be able to view this page, log in first');
    }
});

app.get('/register', function (req, res) {
    res.render('register');
});

app.get("/u/:shortURL", (req, res) => {
    let userId = req.session.userId;
    if (userId) {
        let longURL = urlDatabase[req.params.shortURL].longURL;
        res.redirect(longURL);
    } else {
        res.status(400);
        res.send("Please login or register");
    }
});

app.get('/', (req, res) => {
    res.send('Hello!');
});

app.get('/urls.json', (req, res) => {
    res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
    res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.get('/login', function (req, res) {
    let templateVars = {
        user: userDatabase,
        userId: req.session.userId,
    };

    res.render('login', templateVars);
});

//  All post requests--------------------------------------------------------------------------------------------

app.post('/urls', (req, res) => {
    let shortURL = generateRandomString();
    urlDatabase[shortURL] = {
        shortURL: shortURL,
        longURL: req.body.longURL,
        userId: req.session.userId
    }
    res.redirect('/urls');
});

// Delete url from main page
app.post('/urls/:id/delete', (req, res) => {
    delete urlDatabase[req.params.id];
    res.redirect('/urls');
});

// Changing longUrl value of shortUrl 
app.post('/urls/:id', (req, res) => {
    let longURL = req.body.longURL;
    let shortURL = req.params.id;
    urlDatabase[shortURL].longURL = longURL;
    res.redirect('/urls');
});

// logout and clear cookie-session
app.post('/logout', function (req, res) {
    req.session = null;
    res.redirect('/login');
});

// Function to filter the urlDatabase and compare with the userId to the logged-in user's ID.
function usersUrls(userId) {
    let listUrls = {};
    for (let shortURL in urlDatabase) {
        if (userId === urlDatabase[shortURL].userId) {
            listUrls[shortURL] = urlDatabase[shortURL]
        }
    }
    return listUrls;
};

// Checking if user entered anything to the input field, if yes check if email matches to dataBase, if it does redirect to main page
app.post('/register', function (req, res) {
    if (req.body.email === "" || req.body.password === '') {
        res.status(400).send('You need to enter an email address and a password.');
        return;
    }
    if (checkEmail(req.body.email)) {
        res.status(400).send('Accout already exists, please log in or use another email.');
        return;
    }

    let randomId = generateRandomString();
    let password = req.body.password;
    let hashedPassword = bcrypt.hashSync(password, 10);

    userDatabase[randomId] = {
        userId: randomId,
        email: req.body.email,
        password: hashedPassword
    }
    req.session.userId = randomId;
    res.redirect('/urls');
});

// Checking if user entered something, if yes check if email and password matches to DB, redirect to main page if everythin is ok
app.post('/login', function (req, res) {
    let email = req.body.email;
    let password = req.body.password;
    if (password === '' || email === '') {
        res.send('Please, enter your email and password');
        return;
    } else {
        for (let userId in userDatabase) {
            if (userDatabase[userId].email === email && bcrypt.compareSync(password, userDatabase[userId].password)) {
                req.session['userId'] = userId;
                res.redirect('/urls');
                return;
            }
        }
        res.status(400);
        res.send('Your email or password invalid');
    }

});

// if email exists in database--------------------------------------------------------------------------------------------
function checkEmail(email) {
    for (let userId in userDatabase) {
        if (userDatabase[userId].email === email) {
            return true;
        }
    }
    return false;
};

// Console log for checking port------------------------------------------------------------------------------------------
app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});