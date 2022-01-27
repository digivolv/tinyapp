const { assert } = require("chai");

const { getUserByEmail } = require("../helpers.js");

const testUsers = {
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

describe("getUserByEmail", function () {
  it("should return a user with valid email", () => {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.deepEqual(user.id, expectedUserID);
  });
  it("should return a user object when it's provided with an email that exists in the database", () => {
    const user = getUserByEmail("user@example.com", testUsers);
    assert.isObject(user, "'is an object'");
  });
  it("Should return undefined if we pass in an email that is not in our users database, then our function", () => {
    const user = getUserByEmail("fakeemail@gmail.com", testUsers);
    const expectedResult = undefined;
    assert.deepEqual(user, expectedResult);
  });
});
