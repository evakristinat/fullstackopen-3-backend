//3.12

// const mongoose = require('mongoose');

// if (process.argv.length < 3) {
//   console.log('give password');
//   process.exit(1);
// }

// const password = process.argv[2];

// const url = process.env.MONGODB_URI

// mongoose.connect(url);

// const personSchema = new mongoose.Schema({
//   name: String,
//   number: Number,
// });

// const Person = mongoose.model('Person', personSchema);

// if (process.argv.length > 3) {
//   const person = new Person({
//     name: process.argv[3],
//     number: process.argv[4],
//   });

//   person.save().then((result) => {
//     console.log(`added ${result.name} number ${result.number} to phonebook`);
//     mongoose.connection.close();
//   });
// } else {
//   Person.find({}).then((persons) => {
//     console.log('phonebook:');
//     persons.forEach((person) => {
//       console.log(`${person.name} ${person.number}`);
//     });
//     mongoose.connection.close();
//   });
// }
