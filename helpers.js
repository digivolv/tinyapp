//returns user ID if email exists
const getUserByEmail = function (email, database) {
  for (const user in database) {
    if (email === database[user].email) {
      return user;
    }
  }
  return null;
};
//generates random string for user_id creation
const generateRandomString = function () {
  let result = "";
  let characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

module.exports = { getUserByEmail, generateRandomString };
