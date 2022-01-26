const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
app.use(bodyParser.urlencoded({ extended: true }));
const PORT = 8080;

//./node_modules/.bin/nodemon -L express_server.js//
app.use(cookieParser());
app.set("view engine", "ejs");

//ROUTE DEFINITIONS
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

function generateRandomString() {
  let result = "";
  let characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_index", templateVars);
});

//form
app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

//dynamic page, path depending on shortURL
app.get("/urls/:shortURL", (req, res) => {
  console.log(req.cookies);
  const templateVars = {
    username: req.cookies["username"],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
  };
  res.render("urls_show", templateVars);
});

app.post("/register", (req, res) => {
  // console.log("entering this endpoint");
  // console.log(req.body.id);
  // console.log(req.body.password);
  // console.log(req.body.email);
  let userID = generateRandomString();

  users[userID] = {
    username: req.body.username,
    firstName: req.body.firstName,
    email: req.body.email,
    password: req.body.password,
  };
  res.cookie(userID, "username");
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    shortURL: req.params.shortURL,
  };

  res.render("register", templateVars);
});
//Update your express server so that when it receives a POST request to /urls
// it responds with a redirection to /urls/:shortURL, where shortURL is the random string we generated.

app.post("/urls", (req, res) => {
  console.log("req.body: ", req.body);
  let newShortURL = generateRandomString();
  urlDatabase[newShortURL] = req.body.longURL;
  // console.log(urlDatabase[newShortURL]);
  // console.log(urlDatabase);
  res.redirect(`/urls/${newShortURL}`);
});

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  // console.log(req.body.username);
  // console.log(username);
  res.redirect(`/urls`);
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect(`/urls`);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  if (!longURL) {
    res.send("404: Key not found!");
  }
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL/", (req, res) => {
  console.log(urlDatabase[req.params.shortURL]);
  console.log("req.body: ", req.body);
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect(`/urls/${req.params.shortURL}`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});

app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
