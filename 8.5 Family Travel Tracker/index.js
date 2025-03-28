import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "World",
  password: "cleo",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentUserId = 1;

// let users = [
//   { id: 1, name: "Angela", color: "teal" },
//   { id: 2, name: "Jack", color: "powderblue" },
// ];

//read users table to get id, name, and color
async function checkUsers() {
  const result = await db.query("SELECT * FROM users");
  let users = [];
  result.rows.forEach((user) => {
    users.push(user);
  });
  return users;
}

// async function joinTable() {
//   const result = await db.query(
//     "SELECT users.name, users.color, visited_countries.country_code FROM users INNER JOIN visited_countries ON visited_countries.user_id = users.id"
//   );
//   let userProfile = result.rows.forEach();
// }

//check country_code from the visited_countries that had been added by using currentuserid
async function checkVisisted() {
  const result = await db.query(
    "SELECT country_code FROM visited_countries WHERE user_id = ($1)",
    [currentUserId]
  );
  let countries = [];
  result.rows.forEach((country) => {
    countries.push(country.country_code);
  });
  return countries;
}

//get user color based on their id
async function checkColor() {
  const result = await db.query("SELECT color FROM users WHERE id = ($1)", [
    currentUserId,
  ]);
  if (result.rows.length !== 0) {
    return result.rows[0].color;
  } else {
    throw "no existing user with user id: " + currentUserId;
  }
}

app.get("/", async (req, res) => {
  //showing color of visited countries for the current user.
  // display cuurent user visited countries
  try {
    const countries = await checkVisisted();
    const users = await checkUsers();
    const color = await checkColor();
    res.render("index.ejs", {
      countries: countries,
      total: countries.length,
      users: users,
      color: color,
    });
  } catch (err) {
    console.log(err);
  }
});

app.post("/add", async (req, res) => {
  const input = req.body["country"];

  try {
    const result = await db.query(
      "SELECT country_code FROM countries WHERE country_name ILIKE '%' || $1 || '%';",
      [input]
    );

    const data = result.rows[0];
    const countryCode = data.country_code;
    try {
      await db.query(
        "INSERT INTO visited_countries (country_code, user_id) VALUES ($1, $2)",
        [countryCode, currentUserId] //insert new countries with current user id
      );
      res.redirect("/");
    } catch (err) {
      console.log(err);
    }
  } catch (err) {
    console.log(err);
  }
});

app.post("/user", async (req, res) => {
  //two different types of input to be handled
  console.log("post: /user", req.body);
  if (req.body["user"] !== undefined && req.body["user"] !== null) {
    //check the key & value
    currentUserId = req.body["user"];
    res.redirect("/");
    console.log("set currentUserId to: ", currentUserId);
  } else {
    //handle the add new user
    //same as render ejs
    res.render("new.ejs");
  }
});

app.post("/new", async (req, res) => {
  //Hint: The RETURNING keyword can return the data that was inserted.
  //https://www.postgresql.org/docs/current/dml-returning.html
  //to create a new user profile storing data in the users table
  //use returning to return to new insert users(id)
  try {
    const { name, color } = req.body;
    console.log(name, color);
    const result = await db.query(
      "INSERT INTO users (name, color) VALUES ($1, $2) RETURNING id",
      [name, color]
    );
    console.log(result);
    currentUserId = result.rows[0].id;
    res.redirect("/");
  } catch (error) {
    console.log("Error processing request:", error);
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
