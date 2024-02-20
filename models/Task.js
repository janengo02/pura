const mongoose = require('mongoose')

const TaskSchema = new mongoose.Schema({
   title: {
      type: String,
      default: ''
   },
   schedule: [
      {
         datetime_from: {
            type: Date
         },
         datetime_to: {
            type: Date
         }
      }
   ],
   content: {
      type: String,
      default: ''
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

module.exports = Task = mongoose.model('task', TaskSchema) //name of the database
