require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();
const Person = require("./models/person");

app.use(express.static("build"));
app.use(express.json());
app.use(cors());

// logger middleware
morgan.token("body", function (req, res) {
  return JSON.stringify(req.body);
});
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

function getRandomID(max = 10000) {
  return Math.floor(Math.random() * max);
}

app.get("/api/persons", (request, response, next) => {
  Person.find({})
    .then((people) => {
      response.json(people);
    })
    .catch((error) => next(error));
});

app.get("/api/persons/:id", (request, response, next) => {
  const id = request.params.id;
  Person.findById(id)
    .then((person) => {
      if (person) response.json(person);
      else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.post("/api/persons", (request, response, next) => {
  const { name, number } = request.body;
  if (!number) {
    return response.status(400).json({ error: "number is required." });
  }
  if (!name) {
    return response.status(400).json({ error: "name is required." });
  }
  const personObj = {
    name: name,
    number: number,
  };
  Person.find({ name: name }).then((result) => {
    if (result.length)
      return response.status(400).json({ error: "name must be unique." });
    const person = new Person(personObj);
    person
      .save()
      .then((result) => {
        response.status(201).json(result);
      })
      .catch((error) => next(error));
  });
});

app.put("/api/persons/:id", (request, response, next) => {
  const { name, number } = request.body;

  const person = { name: name, number: number };

  Person.findByIdAndUpdate(request.params.id, person, {
    new: true,
    runValidators: true,
    context: "query",
  })
    .then((updatedData) => {
      response.json(updatedData);
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

app.get("/api/info", (request, response) => {
  Person.find({}).then((people) => {
    const date = new Date();
    response.send(
      `<p>Phonebook has info for ${people.length} people.</p><p>${date}</p>`
    );
  });
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ message: "unknown endpoint" });
};

// handler of requests with unknown endpoint
app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).json({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }

  return response.status(500).json({ error: "Internal Server Error" });

  next(error);
};

// handler of requests with result to errors
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
