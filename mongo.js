const mongoose = require("mongoose");
const nodemon = require("nodemon");

if (process.argv.length < 3) {
  console.log(
    "Please provide the password when running the application: node mongo.js <password>"
  );
  process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://fso-user:${password}@cluster0.jfaeg.mongodb.net/phonebook-app?retryWrites=true&w=majority`;

mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
});

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model("Person", personSchema);

if (process.argv.length > 3) {
  const person = new Person({
    name: process.argv[3],
    number: process.argv[4],
  });

  person.save().then((response) => mongoose.connection.close());
} else {
  Person.find({}).then((response) => {
    response.forEach((note) => console.log(note));
    mongoose.connection.close();
  });
}
