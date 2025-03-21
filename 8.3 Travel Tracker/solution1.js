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

// GET home page
app.get("/", async (req, res) => {
  const result = await db.query("SELECT country_code FROM visited_countries");
  let countries = []; //create an empty array to contain later results
  result.rows.forEach((country) => {
    //loop through each rows in our results. country is an individual row (object) from the query result.forEach iterates over each row in result.rows
    countries.push(country.country_code); //access country_code value which is 'CN' to push each values into this empty array(countries)
  }); //country.country_code extracts the country_code column value from the row
  console.log(result.rows); //console log how the results (data structures) look like. It should look like{ country_code: 'CN' }
  res.render("index.ejs", { countries: countries, total: countries.length }); //send results to the index.ejs
  db.end();
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
