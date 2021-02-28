const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const url = process.env.MONGODB_URI;

mongoose
  .connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then((result) => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connecting to MongoDB:", error.message);
  });

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  number: String,
});

personSchema.plugin(uniqueValidator);

personSchema.set("toJSON", {
  transform: (document, personObject) => {
    personObject.id = personObject._id.toString();
    delete personObject._id;
    delete personObject.__v;
  },
});

module.exports = mongoose.model("Person", personSchema);
