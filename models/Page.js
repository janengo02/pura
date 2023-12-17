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
         type: mongoose.Schema.Types.ObjectId,
         ref: 'progress' //refer to the 'progress' model
      }
   ],
   // group_order: [
   //    {
   //       type: mongoose.Schema.Types.ObjectId,
   //       ref: 'progress' //refer to the 'group' model
   //    }
   // ],
   // task_map: [
   //    {
   //       group: {
   //          type: mongoose.Schema.Types.ObjectId,
   //          ref: 'progress' //refer to the 'progress' model
   //       },
   //       progress: {
   //          type: mongoose.Schema.Types.ObjectId,
   //          ref: 'progress' //refer to the 'group' model
   //       },
   //       tasks: [
   //          {
   //             type: mongoose.Schema.Types.ObjectId,
   //             ref: 'task' //refer to the 'task' model
   //          }
   //       ]
   //    }
   // ],
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
