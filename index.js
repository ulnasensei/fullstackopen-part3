const express = require("express");
const app = express();

app.use(express.json());

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.get("/api/persons/:id", (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id);

    if(person){
        response.json(person);
    }
    else{
        response.status(404).json({status_code: 404, message: "Not Found"})
    }
})

app.delete("/api/persons/:id", (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id);

    if(person){
        persons = persons.filter(person => person.id !== id)
        response.status(204).end()
    }
    else{
        response.status(404).json({status_code: 404, message: "Not Found"})
    }
})

app.get("/api/info", (request, response) => {
    const count = persons.length;
    const date = new Date();

    console.log(count, date);

    response.send(`<p>Phonebook has info for ${count} people.</p><p>${date}</p>`);
})

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
