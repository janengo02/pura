const mongoose = require('mongoose')

const TaskSchema = new mongoose.Schema({
   title: {
      type: String,
      default: ''
   },
   schedule: [
      {
         start: {
            type: Date
         },
         end: {
            type: Date
         },
         google_event_id: {
            type: String,
            default: null
         },
         google_account_id: {
            type: String,
            default: null
         },
         google_calendar_id: {
            type: String,
            default: null
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

module.exports = Task = mongoose.model('task', TaskSchema)
