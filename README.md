# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

!["Main page without an active user"](https://github.com/digivolv/tinyapp/blob/master/data/main-page-no-user.PNG?raw=true)

!["Main page with an active user, displaying created links"](https://github.com/digivolv/tinyapp/blob/master/data/main-page-active-user.PNG?raw=true)

!["Registration"](https://github.com/digivolv/tinyapp/blob/master/data/registration.PNG?raw=true)

!["Specific short URL page where user owns the short URL"](#)

!["Creating a TinyURL"](https://github.com/digivolv/tinyapp/blob/master/data/new-url.PNG?raw=true)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.

### Routing Behaviour

- `GET /`

  - if user is logged in:
    - (Minor) redirect to `/urls`
  - if user is not logged in:
    - (Minor) redirect to `/login`

- `GET /urls`

  - if user is logged in:
    - returns HTML with:
    - the site header (see Display Requirements above)
    - a list (or table) of URLs the user has created, each list item containing:
      - a short URL
      - the short URL's matching long URL
      - an edit button which makes a GET request to `/urls/:id`
      - a delete button which makes a POST request to `/urls/:id/delete`
    - a link to "Create a New Short Link" which makes a GET request to `/urls/new`
  - if user is not logged in:
    - returns HTML with a relevant error message

- `GET /urls/new`

  - if user is logged in:
    - returns HTML with:
    - the site header (see Display Requirements above)
    - a form which contains:
      - a text input field for the original (long) URL
      - a submit button which makes a POST request to `/urls`
  - if user is not logged in:
    - redirects to the `/login` page

- `GET /urls/:id`

  - if user is logged in and owns the URL for the given ID:
    - returns HTML with:
    - the site header (see Display Requirements above)
    - the short URL (for the given ID)
    - a form which contains:
      - the corresponding long URL
      - an update button which makes a POST request to `/urls/:id`
  - if a URL for the given ID does not exist:
    - (Minor) returns HTML with a relevant error message
  - if user is not logged in:
    - returns HTML with a relevant error message
  - if user is logged it but does not own the URL with the given ID:
    - returns HTML with a relevant error message

- `GET /u/:id`

  - if URL for the given ID exists:
    - redirects to the corresponding long URL
  - if URL for the given ID does not exist:
    - returns HTML with a relevant error message

- `POST /urls`

  - if user is logged in:
    - generates a short URL, saves it, and associates it with the user
    - redirects to `/urls/:id`, where `:id` matches the ID of the newly saved URL
  - if user is not logged in:
    - returns HTML with a relevant error message

- `POST /urls/:id`

  - if user is logged in and owns the URL for the given ID:
    - updates the URL
    - redirects to `/urls`
  - if user is not logged in:
    - (Minor) returns HTML with a relevant error message
  - if user is logged it but does not own the URL for the given ID:
    - (Minor) returns HTML with a relevant error message
  - `POST /urls/:id/delete`
  - if user is logged in and owns the URL for the given ID:
    - deletes the URL
    - redirects to `/urls`
  - if user is not logged in:
    - returns HTML with a relevant error message
  - if user is logged it but does not own the URL for the given ID:
    - returns HTML with a relevant error message

- `GET /login`

  - if user is logged in:
    - redirects to `/urls`
  - if user is not logged in:
    - returns HTML with:
    - a form which contains:
      - input fields for email and password
      - submit button that makes a POST request to `/login`

- `GET /register`

  - if user is logged in:
    - redirects to `/urls`
  - if user is not logged in:
    - returns HTML with:
    - a form which contains:
      - input fields for email and password
      - a register button that makes a POST request to `/register`

- `POST /login`

  - if email and password params match an existing user:
    - sets a cookie
    - redirects to `/urls`
  - if email and password params don't match an existing user:
    - returns HTML with a relevant error message

- `POST /register`

  - if email or password are empty:
    - returns HTML with a relevant error message
  - if email already exists:
    - returns HTML with a relevant error message
  - otherwise:
    - creates a new user
    - encrypts the new user's password with `bcrypt`
    - sets a cookie
    - redirects to `/urls`

- `POST /logout`

  - deletes cookie
  - redirects to `/urls`
