const mongoose = require('mongoose')

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
   google_accounts: [
      {
         refresh_token: {
            type: String,
            required: true
         },
         account_email: {
            type: String,
            required: true
         },
         sync_status: {
            type: Boolean,
            required: true,
            default: true
         },
         is_default: {
            type: Boolean,
            required: true,
            default: false
         }
      }
   ],
   create_date: {
      type: Date,
      default: Date.now
   },
   update_date: {
      type: Date,
      default: Date.now
   }
})

module.exports = User = mongoose.model('user', UserSchema) //name of the database
