const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const users = require("./data/users.json");
const urlDatabase = require("./data/urlDatabase.json");
app.use(bodyParser.urlencoded({ extended: true }));
const morgan = require("morgan");
const PORT = 8888;

// console.log(users);
//./node_modules/.bin/nodemon -L express_server.js//
app.use(cookieParser());
app.set("view engine", "ejs");
morgan("tiny");

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

function urlsForUser(id) {
  let resultURLs = {};
  for (url in urlDatabase) {
    if (id === urlDatabase[url].user_id) {
      resultURLs[url] = urlDatabase[url];
    }
  }
  return resultURLs;
}

app.get("/", (req, res) => {
  res.redirect("/urls/");
});

app.get("/urls", (req, res) => {
  let userURLs = urlsForUser(req.cookies["user"]);
  const templateVars = {
    // urls: urlDatabase, // removed in favor of userURLs
    user: users[req.cookies["user"]],
    userURLs: userURLs,
  };
  // console.log("userURLs", templateVars.userURLs);
  // console.log(userURLs);
  // console.log("(templateVars.urls", templateVars.urls);
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
  //only load if there if shortURL exists in urlDatabase
  if (urlDatabase.hasOwnProperty(req.params.shortURL)) {
    const templateVars = {
      user: users[req.cookies["user"]],
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      urls: urlDatabase,
    };
    res.render("urls_show", templateVars);
  } else {
    res.send("400: Invalid file path! Not a valid shortURL ");
  }
});

app.post("/urls/:shortURL/", (req, res) => {
  // console.log(urlDatabase[req.params.shortURL]);
  // console.log("req.body: ", req.body);
  for (url in urlDatabase) {
    // console.log("url,,", urlDatabase[url].user_id);
    // console.log("req.cookies", req.cookies["user"]);
    if (urlDatabase[req.params.shortURL].user_id === req.cookies["user"]) {
      urlDatabase[req.params.shortURL].longURL = req.body.longURL;
      res.redirect(`/urls/${req.params.shortURL}`);
    }
  }
  res.send(
    "403 Error, you do not possess authority to edit this! Please login and try again"
  );
});

// app.get("/u/:shortURL", (req, res) => {
//   const longURL = urlDatabase[req.params.shortURL].longURL;

//   const templateVars = {
//     urls: urlDatabase, // removed in favor of userURLs
//     user: users[req.cookies["user"]],
//     shortURL: req.params.shortURL,
//     longURL: longURL,
//   };

//   //if no corresponding shortURL to longURL throw error

//   //************************* not sure if needed */
//   if (!longURL) {
//     res.send("400: Key not found!");
//   }
//   res.render("urls_show", templateVars);
// });

app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase.hasOwnProperty(req.params.shortURL)) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  } else {
    return res.status(403).send("Short URL is not found within database");
  }
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
    res.send(
      "400 Email has already been previously registered with another account"
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
    res.send("403 Email is not found");
  }
  // res.cookie("user", req.body.user);
  res.redirect(`/urls`);
});

app.post("/logout", (req, res) => {
  res.clearCookie("user");
  res.redirect(`/urls`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  //search url database to make sure it matches person logged in (cookie)
  for (url in urlDatabase) {
    // console.log("url,,", urlDatabase[url].user_id);
    // console.log("req.cookies", req.cookies["user"]);
    if (urlDatabase[url].user_id === req.cookies["user"]) {
      delete urlDatabase[req.params.shortURL];
      res.redirect("/urls");
    }
  }
  res.send(
    "403 Error, you do not possess authority to delete this! Please login and try again"
  );
});

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
