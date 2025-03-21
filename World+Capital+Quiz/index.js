import express, { query } from "express";
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

//let quiz = [
//{ country: "France", capital: "Paris" },
//{ country: "United Kingdom", capital: "London" },
//{ country: "United States of America", capital: "New York" },
//];

let quiz = [];
//use database to replace all the quiz content
db.query("SELECT * FROM capitals", (err, res) => {
  //(err, res) is a call back to check if there is any error. res short for response
  if (err) {
    // if there is an error, log the error in the console
    console.error("Error executting query", err.stack);
  } else {
    // if no error, set quiz equal to res.rows so that give all of the rows in the capitals table
    // res.rows hold the fetched records if the query is successful
    quiz = res.rows;
  }
  db.end();
});

let totalCorrect = 0;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentQuestion = {};

// GET home page
app.get("/", async (req, res) => {
  totalCorrect = 0;
  await nextQuestion();
  console.log(currentQuestion);
  res.render("index.ejs", { question: currentQuestion });
});

// POST a new post
app.post("/submit", (req, res) => {
  let answer = req.body.answer.trim();
  let isCorrect = false;
  if (currentQuestion.capital.toLowerCase() === answer.toLowerCase()) {
    totalCorrect++;
    console.log(totalCorrect);
    isCorrect = true;
  }

  nextQuestion();
  res.render("index.ejs", {
    question: currentQuestion,
    wasCorrect: isCorrect,
    totalScore: totalCorrect,
  });
});

async function nextQuestion() {
  const randomCountry = quiz[Math.floor(Math.random() * quiz.length)];

  currentQuestion = randomCountry;
}

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
