const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const users = require("./data/users.json");
const urlDatabase = require("./data/urlDatabase.json");
app.use(bodyParser.urlencoded({ extended: true }));
const PORT = 8082;

// console.log(users);
//./node_modules/.bin/nodemon -L express_server.js//
app.use(cookieParser());
app.set("view engine", "ejs");

//ROUTE DEFINITIONS

// const users = {
//   userRandomID: {
//     id: "userRandomID",
//     email: "user@example.com",
//     password: "purple-monkey-dinosaur",
//   },
//   user2RandomID: {
//     id: "user2RandomID",
//     email: "user2@example.com",
//     password: "dishwasher-funk",
//   },
// };

function generateRandomString() {
  let result = "";
  let characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
// users[req.cookies["user"]].email,

//returns user ID if email exists
function checkIfEmailExists(inputEmail) {
  for (const user in users) {
    if (inputEmail === users[user].email) {
      return user;
    }
  }
  return false;
}

app.get("/", (req, res) => {
  res.redirect("/urls/");
});
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user"]],
  };
  // console.log("user, ", templateVars.user);
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const newShortURL = generateRandomString();
  urlDatabase[newShortURL] = {
    longURL: req.body.longURL,
    user_id: users[req.cookies["user"]].user_id,
  };
  // console.log(urlDatabase);
  res.redirect(`/urls/${newShortURL}`);
});

app.get("/urls/new", (req, res) => {
  if (!users[req.cookies["user"]]) {
    res.redirect("/login");
  }
  const templateVars = { user: users[req.cookies["user"]] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user"]],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/", (req, res) => {
  // console.log(urlDatabase[req.params.shortURL]);
  // console.log("req.body: ", req.body);
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect(`/urls/${req.params.shortURL}`);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  //if no corresponding shortURL to longURL throw error
  if (!longURL) {
    res.send("404: Key not found!");
  }
  // res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user"]],
    // shortURL: req.params.shortURL,
  };

  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  if (!req.body.firstName || !req.body.email || !req.body.password) {
    res.sendStatus(400).send("All input fields required");
  }
  if (checkIfEmailExists(req.body.email)) {
    res
      .sendStatus(400)
      .send(
        "Email has already been previously registered with another account"
      );
  }
  let user_id = generateRandomString();
  users[user_id] = {
    user_id: user_id,
    firstName: req.body.firstName,
    email: req.body.email,
    password: req.body.password,
  };
  console.log(users);
  res.cookie("user", user_id);
  res.redirect("/urls");
});

//Update your express server so that when it receives a POST request to /urls
// it responds with a redirection to /urls/:shortURL, where shortURL is the random string we generated.
app.get("/login", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user"]],
  };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  // console.log(req.body.email);
  let user_id = checkIfEmailExists(req.body.email);

  // console.log("req.body.password,", req.body.password);
  // console.log("user.password,", user_id.password);
  if (users[user_id].password === req.body.password) {
    // console.log("user:", user);
    res.cookie("user", user_id);
  } else if (!checkIfEmailExists(req.body.email)) {
    res.sendStatus(403).send("Email is not found");
  }
  // res.cookie("user", req.body.user);
  res.redirect(`/urls`);
});

app.post("/logout", (req, res) => {
  res.clearCookie("user");
  res.redirect(`/urls`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
