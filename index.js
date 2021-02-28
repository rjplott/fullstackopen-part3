require("dotenv").config();
const Person = require("./models/person");
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

app.get("/info", (request, response, next) => {
  Person.find({})
    .then((persons) => {
      const date = new Date();
      const information = `Phonebook has information on ${persons.length} people`;
      return response.send(`
    <div>${information}</div>
    <div>${date}</div>
  `);
    })
    .catch((error) => next(error));
});

app.get("/api/persons", (request, response, next) => {
  Person.find({})
    .then((persons) => response.json(persons))
    .catch((error) => next(error));
});

app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      response.json(person);
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then((res) => {
      response.status(204).end();
    })
    .catch((err) => {
      next(err);
    });
});

app.post("/api/persons", (request, response, next) => {
  const newPerson = new Person({
    name: request.body.name,
    number: request.body.number,
  });

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

  newPerson
    .save()
    .then((person) => response.json(person))
    .catch((err) => {
      console.log(err);
      next(err);
    });
});

app.put("/api/persons/:id", (request, response, next) => {
  const body = request.body;
  const person = {
    name: body.name,
    number: body.number,
  };

  Person.findByIdAndUpdate(request.params.id, person, {
    new: true,
    runValidators: true,
    context: "query",
  })
    .then((updatedPerson) => response.json(updatedPerson))
    .catch((error) => next(error));
});

const unknownEndpoint = (request, response) =>
  response.status(404).send({ error: "unknown endpoint" });

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.error(error.name);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "Malformed ID" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json(error.message);
  }

  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
