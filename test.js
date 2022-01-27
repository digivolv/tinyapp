const urlDatabase = require("./data/urlDatabase.json");

urlDatabase["hehehe"] = {
  longURL: "moneymaker.com",
  user_id: "420blazeit",
};
urlDatabase["ddddd"] = "pood";
urlDatabase["ddddd"]["pood"] = "fefefe";
urlDatabase["hehehe"]["poop"] = "pee";
console.log(urlDatabase);

console.log(urlDatabase["9sm5xK"]["longURL"]);

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };
