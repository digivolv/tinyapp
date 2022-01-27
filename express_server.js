const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const urlDatabase = require("./data/urlDatabase.json");
const morgan = require("morgan");
const bcrypt = require("bcryptjs");
const salt = bcrypt.genSaltSync(10);
const { getUserByEmail, generateRandomString } = require("./helpers");
// const users = require("./data/users.json");
// const cookieParser = require("cookie-parser");
//./node_modules/.bin/nodemon -L express_server.js//

app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("tiny"));
app.use(
  cookieSession({
    usename: "session",
    keys: [
      "861a4ba3-7bfe-420a-9ce2-a49a25c61645",
      "4e32a74a-b55b-4a50-a8cc-6384ce6a5dfc",
    ],
  })
);
// app.use(cookieParser());
app.set("view engine", "ejs");
const PORT = 8889;

const users = {
  userRandomID: {
    user_id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    user_id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
  123123: {
    user_id: "123123",
    email: "edwin@gmail.com",
    password: bcrypt.hashSync("123", salt),
  },
};

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
  if (req.session.user_id) {
    res.redirect("/urls/");
  } else {
    res.redirect("/login/");
  }
});

app.get("/urls", (req, res) => {
  let userURLs = urlsForUser(req.session.user_id);
  const templateVars = {
    user: users[req.session.user_id],
    userURLs: userURLs,
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const newShortURL = generateRandomString();
  urlDatabase[newShortURL] = {
    longURL: req.body.longURL,
    user_id: users[req.session.user_id].user_id,
  };
  res.redirect(`/urls/${newShortURL}`);
});

app.get("/urls/new", (req, res) => {
  if (!users[req.session.user_id]) {
    res.redirect("/login");
  }
  const templateVars = { user: users[req.session.user_id] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  if (
    urlDatabase.hasOwnProperty(req.params.shortURL) &&
    req.session.user_id === urlDatabase[req.params.shortURL].user_id
  ) {
    const templateVars = {
      user: users[req.session.user_id],
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      urls: urlDatabase,
    };
    res.render("urls_show", templateVars);
  } else {
    res.send(
      "400: Invalid file path! Not a valid shortURL or you are unauthorized to view this page!"
    );
  }
});

app.post("/urls/:shortURL/", (req, res) => {
  for (url in urlDatabase) {
    if (urlDatabase[req.params.shortURL].user_id === req.session.user_id) {
      urlDatabase[req.params.shortURL].longURL = req.body.longURL;
      console.log(
        "req.session.user_id: THE COOKIE DECRYPTS WHEN ITS RETURNED",
        req.session.user_id
      );
      res.redirect(`/urls/${req.params.shortURL}`);
    }
  }
  res.send(
    "403 Error, you do not possess authority to edit this! Please login and try again"
  );
});

app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase.hasOwnProperty(req.params.shortURL)) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  } else {
    return res.status(403).send("403 Short URL is not found within database");
  }
});

app.get("/register", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  }

  const templateVars = {
    user: users[req.session.user_id],
  };

  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  if (!req.body.firstName || !req.body.email || !req.body.password) {
    res.send("400 All input fields required");
  }
  if (getUserByEmail(req.body.email, users)) {
    res.send(
      "400 Email has already been previously registered with another account"
    );
  }
  let hashedPassword = bcrypt.hashSync(req.body.password, salt);
  let user_id = generateRandomString();
  users[user_id] = {
    user_id: user_id,
    firstName: req.body.firstName,
    email: req.body.email,
    password: hashedPassword,
  };
  console.log(users);
  // res.cookie("user", user_id);
  req.session.user_id = user_id;
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  }

  const templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_id],
  };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  //if email exists
  if (getUserByEmail(req.body.email, users)) {
    let user_id = getUserByEmail(req.body.email, users).user_id;

    //if passwords match
    if (bcrypt.compareSync(req.body.password, users[user_id].password)) {
      req.session.user_id = user_id;
      res.redirect(`/urls`);
    } else {
      res.send("403 Email and password combination not found");
    }
  } else {
    res.send("403 Email and password combination not found");
  }
});

app.post("/logout", (req, res) => {
  // res.clearCookie("user");
  req.session.user_id = null;
  res.redirect(`/urls`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  //search url database to make sure it matches person logged in (cookie)
  for (url in urlDatabase) {
    if (urlDatabase[url].user_id === req.session.user_id) {
      delete urlDatabase[req.params.shortURL];
      res.redirect("/urls");
    }
  }
  return res
    .sendStatus(403)
    .send(
      "403 Error, you do not possess authority to delete this! Please login and try again"
    );
});

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
