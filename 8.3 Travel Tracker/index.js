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

app.use(bodyParser.urlencoded({ extended: true })); //hold the data user input
app.use(express.static("public"));

//this for featch final code from user input that have already agaist to the countrie table for getting correct code
async function checkVisisted() {
  const result = await db.query("SELECT country_code FROM visited_countries");

  // let countries = [];//to store country_code data
  // result.rows.forEach((country) => {
  //   countries.push(country.country_code);
  // });
  // return countries;

  let countries = result.rows.map((country) => country.country_code); //advanced solution

  console.log(countries);
  return countries;
}

app.get("/", async (req, res) => {
  const countries = await checkVisisted();
  res.render("index.ejs", { countries: countries, total: countries.length });
});

app.post("/add_country", async (req, res) => {
  //listen to post req on the /add_country path
  const visted_country_name = req.body["country"]; //hold user input country_name
  //better solution
  const result = await db.query(
    "SELECT country_code FROM countries WHERE country_name ILIKE '%' || $1 || '%'",
    [visted_country_name] // WHERE country_name ILIKE CONCAT('%', $1, '%'), here postgre cannot know the type of $1. need to add $1::TEXT
  );
  console.log(result.rows);

  if (result.rows.length !== 0) {
    const countryCode = result.rows[0].country_code;
    try {
      await db.query(
        "INSERT INTO visited_countries (country_code) VALUES ($1)",
        [countryCode]
      );
      res.redirect("/");
    } catch (err) {
      const countries = await checkVisisted();
      res.render("index.ejs", {
        countries: countries,
        total: countries.length,
        error: "Country has already been added, try again.",
      });
    }
  } else {
    const countries = await checkVisisted();
    res.render("index.ejs", {
      countries: countries,
      total: countries.length,
      error: "Country doesn't exist. Try again!",
    });
  }
});

//this is a  method pull out all data from db  // console.log(input);
//   const result = await db.query(
//     "SELECT country_name, country_code from countries"
//   );
//   let country_names = result.rows.map((country) => country.country_name);
//   let country_codes = result.rows.map((country) => country.country_code); //country_code array
//   const founded = country_names.indexOf(visted_country_name); //position of the country in the array
//   if (founded >= 0) {
//     console.log("match found");
//     //then get country_code
//     const answer = country_codes[founded];
//     console.log(answer);
//     await db.query("INSERT INTO visited_countries (country_code) VALUES ($1)", [
//       answer,
//     ]);
//   } else {
//     //send error msg to the user
//     console.log("match not found");
//   }
//   res.redirect("/");
// });

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
