const Reply = require('../models/repliesSchema')
const Thread = require('../models/threadSchema')


exports.postReply = async (req, res, next) => {
   try {
      const board = req.params.board
      const { thread_id, text, delete_password } = req.body

      const newReply = new Reply({ 
         board,
         thread_id, 
         text, 
         delete_password,
         reported: false
      }) 
      await newReply.save()
      
      const thread = await Thread.updateOne(
         { _id: thread_id }, 
         { $set: { bumped_on: new Date() }, $push: { replies: newReply._id } }
         )       
      
      if (!thread.ok) { throw 'unable to post reply'}

      return res.redirect(`/b/${board}/${thread_id}`)
         
   } catch(err) { 
      console.error('*-*-*-*-*-*\n', err, '\n*-*-*-*-*-**-') 
      return res.status(200)
         .json(typeof err === 'string' ? err : 'errors has occured')
   }
}


exports.deleteReply = async (req, res, next) => {
   try {
      const board = req.params.board
      const { thread_id, reply_id, delete_password } = req.body
      
      const reply = await Reply.findOne({ _id: reply_id })
      if (!reply) { throw 'Could not find thread to delete' }
      if (reply.delete_password !== delete_password) { throw 'incorrect password' }

      await Reply.updateOne({ _id: reply_id}, { text: '[deleted]' })

      return res.status(200).type('text').send('success')   

   } catch(err) { 
      console.error('*-*-*-*-*-*\n', err, '\n*-*-*-*-*-**-') 
      return res.status(200)
         .json(typeof err === 'string' ? err : 'errors has occured')
   }
}



exports.reportReply = async (req, res, next) => {
   try {
      const board = req.params.board
      const { thread_id, reply_id } = req.body

      const reply = await Reply
         .updateOne({ _id: reply_id, thread_id, board }, { reported: true })
      if (!reply.ok) { throw 'unable to report reply' }  

      return res.status(200).type('text').send('reported') 
   } catch (err) { 
      console.error(err) 
      return res.status(200)
         .json(typeof err === 'string' ? err : 'error has occured')
   }
}