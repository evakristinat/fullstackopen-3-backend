require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
// const cors = require('cors');
const Person = require('./models/person')

const app = express()

app.use(express.static('build'))
app.use(express.json())

//Virheitä käsittelevä middleware väärässä muodossa syötetylle IDlle.
const errorHandler = (error, req, res, next) => {
  console.log(error.message)

  if (error.name === 'CastError') {
    // 400 - Bad Request ja kuvaava viesti, kun muoto on väärä
    return res.status(400).send({ error: 'malformatted id' })
    // tai validointi ei onnistu
  } else if (error.name === 'ValidationError') {
    return res.status(400).send({ error: error.message })
    // tai Mongoosen unique validator heittää virheen
  } else if (error.name === 'MongoServerError') {
    return res.status(400).send({ error: error.message })
  }

  next(error)
}

//Custom 'req'-token morganille, joka näyttää pyynnön bodyn logissa, mikäli sellainen on.
morgan.token('req', (req) => {
  const body = JSON.stringify(req.body)
  if (body !== '{}') {
    return body
  } else {
    return '- no request body'
  }
})

//Custom token lisätty logiin viimeiseksi ':req'
app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :req')
)

// Cors oli käytössä kehitysvaiheessa, mutta nyt tarpeeton.
// app.use(cors());

// Ennen Mongoa käytetty ID, tuplien tarkastus ei tullut testauksessa tarpeelliseksi.
// const generateId = () => {
//   return Math.floor(Math.random() * 100);
// };

//Infon ja päivämäärän näyttäminen /info reitistä
app.get('/info', (req, res) => {
  res.send(`<p>Phonebook has ${Person.length} contacts.</p><p>${Date()}</p>`)
})

//Kaikkien tietojen haku rajapinnasta
app.get('/api/persons', (req, res, next) => {
  Person.find({})
    .then((people) => res.json(people))
    .catch((error) => next(error))
})

//Tietyn henkilön haku rajapinnasta
app.get('/api/persons/:id', (req, res, next) => {
  //vanha toteutus ennen tietokantaa:
  // const person = persons.find((person) => person.id === id);

  Person.findById(req.params.id)
    .then((person) => {
      if (person) {
        res.json(person)
      } else {
        res.status(404).end()
      }
    })
    .catch((error) => next(error))
})

//Uuden henkilön lisääminen sovellukseen
app.post('/api/persons', (req, res, next) => {
  const body = req.body
  const newPerson = new Person({
    name: body.name,
    number: body.number,
    // id: body.id || generateId(),
  })
  newPerson
    .save()
    .then((savedPerson) => savedPerson.toJSON())
    .then((savedPersonInJSON) => res.json(savedPersonInJSON))
    .catch((error) => next(error))
})

//Henkilön päivitys
app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body

  //huom. Person konstruktorilla luotu olio ei käy findByIdAndUpdaten parametriksi
  const person = {
    name: body.name,
    number: body.number,
  }

  //ellei {new: true} parametriä olisi lisätty palautettaisiin muutosta edeltävä tila
  Person.findByIdAndUpdate(req.params.id, person, { new: true })
    .then((updatedPerson) => {
      res.json(updatedPerson)
    })
    .catch((error) => next(error))
})

//Henkilön poistaminen sovelluksesta (ja tietokannasta)
app.delete('/api/persons/:id', (req, res, next) => {
  // Vanha toteutus ennen tietokannan lisäystä:
  // persons = persons.filter((person) => person.id !== id);

  Person.findByIdAndRemove(req.params.id)
    .then(() => {
      //204 - No Content kertoo että pyyntö on onnistunut, eli tieto on poissa, mutta sivulta ei tarvitse poistua.
      res.status(204).end()
    })
    .catch((error) => next(error))
})

//Mikäli tuntematon endpoint syötetään urliin, palautetaan 404 - Page Not Found ja näytetään viesti "unknown endpoint"
const unkownEndPoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

app.use(unkownEndPoint)

app.use(errorHandler)

const PORT = process.env.PORT

app.listen(PORT),
() => {
  console.log(`Server running on port ${PORT}`)
}
