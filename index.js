const { request } = require("express");
const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");

app.use(express.json());
app.use(
  morgan(function (tokens, req, res) {
    morgan.token("json/body", (req, res) => {
      return JSON.stringify(req.body);
    });
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, "content-length"),
      "-",
      tokens["response-time"](req, res),
      "ms",
      tokens["json/body"](req, res),
    ].join(" ");
  })
);

app.use(cors());
app.use(express.static("build"));

let persons = [
  {
    name: "Arto Hellas",
    number: "040-123456",
    id: 1,
  },
  {
    name: "Ada Lovelace",
    number: "39-44-5323523",
    id: 2,
  },
  {
    name: "Dan Abramov",
    number: "12-43-234345",
    id: 3,
  },
  {
    name: "Mary Poppendieck",
    number: "39-23-6423122",
    id: 4,
  },
];

app.get("/info", (request, response) => {
  const date = new Date();
  const information = `Phonebook has information on ${persons.length} people`;

  response.send(`
    <div>${information}</div>
    <div>${date}</div>
  `);
});

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((person) => person.id === id);

  if (!person) {
    response.status(404).end();
  } else {
    response.json(person);
  }
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);

  if (!id) {
    response.status(404).end();
  } else {
    persons = persons.filter((person) => person.id !== id);
    response.status(204).end();
    console.log(persons);
  }
});

const generateId = () => {
  return Math.round(Math.random() * 10000000);
};

app.post("/api/persons", (request, response) => {
  const newPerson = {
    ...request.body,
    id: generateId(),
  };

  if (!newPerson.name)
    return response.status(400).json({
      error: "Name must not be missing",
    });

  if (!newPerson.number)
    return response.status(400).json({
      error: "Number must not be missing",
    });

  if (persons.find((person) => person.name === newPerson.name))
    return response.status(400).json({
      error: "Name must be unique",
    });

  persons = persons.concat(newPerson);
  response.json(newPerson);
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
