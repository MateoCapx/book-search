const { Schema, model } = require('mongoose');
const bcrypt = require('bcrypt');

// import schema from Book.js
const bookSchema = require('./Book');

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/.+@.+\..+/, 'Must use a valid email address'],
    },
    password: {
      type: String,
      required: true,
    },
    // set savedBooks to be an array of data that adheres to the bookSchema
    savedBooks: [bookSchema],
  },
  // set this to use virtual below
  {
    toJSON: {
      virtuals: true,
    },
  }
);


// Always hash password before storing them into a database so hackers can't get
// sensitive informtion
// hash user password
userSchema.pre('save', async function (next) {
  if (this.isNew || this.isModified('password')) {
    // saltRounds is added to the begining of the hashed password so its 
    //harder for hackers to decript it.
    const saltRounds = 10;
    //This refers to the INSTANCE OF THE USER we are trying to create
    this.password = await bcrypt.hash(this.password, saltRounds);
  }

  next();
});

// Another way to create salt variable
//  const salt = await bcrypt.genSalt(10)



// custom method to compare and validate password for logging in
userSchema.methods.isCorrectPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

// when we query a user, we'll also get another field called `bookCount` with the number of saved books we have
userSchema.virtual('bookCount').get(function () {
  return this.savedBooks.length;
});

const User = model('User', userSchema);

module.exports = User;
