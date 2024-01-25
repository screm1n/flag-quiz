import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "angela",
  port: 3000,
});

const app = express();
const port = 4000;

db.connect();

let quiz = [];
db.query("SELECT * FROM flagspt", (err, res) => {
  if (err) {
    console.error("Error executing query", err.stack);
  } else {
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
  if (currentQuestion.name.toLowerCase() === answer.toLowerCase()) {
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

let lastRandomIndex = -1;

async function nextQuestion() {
  const randomIndex = getRandomIndex();
  const randomCountry = quiz[randomIndex];

  currentQuestion = randomCountry;
}

function getRandomIndex() {
  let randomIndex;

  do {
    randomIndex = Math.floor(Math.random() * quiz.length);
  } while (randomIndex === lastRandomIndex);

  lastRandomIndex = randomIndex;
  return randomIndex;
}

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
