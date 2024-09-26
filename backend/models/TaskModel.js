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
         sync_info: [
            {
               account_id: {
                  type: String
               },
               event_id: {
                  type: String
               },
               is_matched: {
                  type: Boolean,
                  default: true
               }
            }
         ]
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
