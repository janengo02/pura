const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
   email: {
      type: String,
      required: true,
      unique: true
   },
   password: {
      type: String,
      required: true
   },
   name: {
      type: String,
      required: true
   },
   avatar: {
      type: String
   },
   create_date: {
      type: Date,
      default: Date.now
   },
   update_date: {
    type: Date,
    default: Date.now
 }
})

module.exports = User = mongoose.model("user", UserSchema) //name of the database