const { Schema, model } = require('mongoose')


const threadSchema = new Schema({
   board: { type: String, required: true },
   text: { type: String, required: true },
   bumped_on: { type: Date, required: true },
   reported: { type: Boolean, required: true },
   delete_password: { type: String, required: true },
   replies: [{ type: Schema.Types.ObjectId, ref: 'Reply', required: true }]
},
{ timestamps: true }
)

module.exports = model('Thread', threadSchema)