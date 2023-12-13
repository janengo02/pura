const mongoose = require('mongoose')

const PageSchema = new mongoose.Schema({
   user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user', //refer to the 'user' model
      required: true
   },
   title: {
      type: String,
      required: true
   },
   sync_accounts: [
      {
         tool: {
            type: String
         },
         email: {
            type: String
         }
      }
   ],
   progress_order: [
      {
         progress: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'progress', //refer to the 'progress' model
            required: true
         }
      }
   ],
   group_order: [
      {
         group: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'progress', //refer to the 'group' model
            required: true
         }
      }
   ],
   taskMap: [
      {
         group: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'progress', //refer to the 'group' model
            required: true
         },
         progress: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'progress', //refer to the 'progress' model
            required: true
         },
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

module.exports = Page = mongoose.model('page', PageSchema) //name of the database
