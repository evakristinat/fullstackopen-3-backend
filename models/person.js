require('dotenv').config()

const mongoose = require('mongoose')
const uniqueValidation = require('mongoose-unique-validator')

const url = process.env.MONGODB_URI

console.log('connecting to', url)
mongoose
  .connect(url)
  .then(() => {
    console.log('connected')
  })
  .catch((error) => {
    console.log('error connecting', error.message)
  })

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
    required: true,
    unique: true,
  },
  number: {
    type: String,
    minlength: 8,
    maxlength: 12,
    required: true,
    unique: true,
  },
})

personSchema.plugin(uniqueValidation)

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

module.exports = mongoose.model('Person', personSchema)
