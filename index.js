const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const app = express();

app.use(express.static('build'));

app.use(express.json());

morgan.token('req', (req) => {
  const body = JSON.stringify(req.body);
  if (body !== '{}') {
    return body;
  } else {
    return '- no request body';
  }
});

app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :req')
);

app.use(cors());

const generateId = () => {
  return Math.floor(Math.random() * 100);
};

let persons = [
  {
    name: 'Arto Hellas',
    number: '040-123456',
    id: 1,
  },
  {
    name: 'Ada Lovelace',
    number: '39-44-5323523',
    id: 2,
  },
  {
    name: 'Dan Abramov',
    number: '12-43-234345',
    id: 3,
  },
  {
    name: 'Mary Poppendieck',
    number: '39-23-6423122',
    id: 4,
  },
];

app.get('/info', (req, res) => {
  res.send(`<p>Phonebook has ${persons.length} contacts.</p><p>${Date()}</p>`);
});

app.get('/api/persons', (req, res) => {
  res.json(persons);
});

app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id);
  const person = persons.find((person) => person.id === id);

  if (person) {
    res.json(person);
  } else {
    res.status(404).end();
  }
});

app.post('/api/persons', (req, res) => {
  const body = req.body;
  const findName = persons.find((person) => person.name === body.name);

  if (!body.name || !body.number) {
    return res.status(400).json({
      error: 'name or number missing',
    });
  } else if (findName) {
    return res.status(400).json({
      error: 'name must be unique',
    });
  }

  const person = {
    name: body.name,
    number: body.number,
    id: body.id || generateId(),
  };

  persons = persons.concat(person);

  res.json(person);
});

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id);
  persons = persons.filter((person) => person.id !== id);

  res.status(204).end();
});

const PORT = process.env.PORT || 3001;
app.listen(PORT);
console.log(`Server running on port ${PORT}`);
