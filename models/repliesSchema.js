const { Schema, model } = require('mongoose')


const repliesSchema = new Schema({
   board: { type: String, required: true },
   thread_id: { type: Schema.Types.ObjectId, required: true },
   text: { type: String, required: true },
   reported: { type: Boolean, required: true },
   delete_password: { type: String, required: true }
},
{ timestamps: true }
)

module.exports = model('Reply', repliesSchema)