const express = require("express");
const app = express();
const bodyParser = require("body-parser");
// const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
// const users = require("./data/users.json");
const urlDatabase = require("./data/urlDatabase.json");
const morgan = require("morgan");
const bcrypt = require("bcryptjs");
const salt = bcrypt.genSaltSync(10);
const { getUserByEmail, generateRandomString } = require("./helpers");
// const getUserByEmail = require("./helpers");
// const generateRandomString = require("./helpers");

// const hashedPassword = brypt.hashSync(password, salt);

// //returns user ID if email exists
// const getUserByEmail = function (email, database) {
//   for (const user in users) {
//     if (email === database[user].email) {
//       return user;
//     }
//   }
//   return null;
// };
// //generates random string for user_id creation
// const generateRandomString = function () {
//   let result = "";
//   let characters =
//     "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
//   for (let i = 0; i < 6; i++) {
//     result += characters.charAt(Math.floor(Math.random() * characters.length));
//   }
//   return result;
// };

const PORT = 8888;

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
//./node_modules/.bin/nodemon -L express_server.js//
// app.use(cookieParser());
app.set("view engine", "ejs");

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
    // urls: urlDatabase, // removed in favor of userURLs
    user: users[req.session.user_id],
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
    user_id: users[req.session.user_id].user_id,
  };
  // console.log(urlDatabase);
  res.redirect(`/urls/${newShortURL}`);
});

app.get("/urls/new", (req, res) => {
  if (!users[req.session.user_id]) {
    res.redirect("/login");
    // res.send("403: Must be logged in to create shortened links!");
  }
  const templateVars = { user: users[req.session.user_id] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  //only load if there if shortURL exists in urlDatabase

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
  // console.log(urlDatabase[req.params.shortURL]);
  // console.log("req.body: ", req.body);
  for (url in urlDatabase) {
    // console.log("url,,", urlDatabase[url].user_id);
    // console.log("req.cookies", req.cookies["user"]);
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
    return res.status(403).send("403 Short URL is not found within database");
  }
});

app.get("/register", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  }

  const templateVars = {
    user: users[req.session.user_id],
    // shortURL: req.params.shortURL,
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

//Update your express server so that when it receives a POST request to /urls
// it responds with a redirection to /urls/:shortURL, where shortURL is the random string we generated.
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
    // console.log("url,,", urlDatabase[url].user_id);
    // console.log("req.cookies", req.cookies["user"]);
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
