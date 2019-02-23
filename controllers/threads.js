const Thread = require('../models/threadSchema')
const Reply = require('../models/repliesSchema')



exports.createThread = async (req, res, next) => {
   try {
      const { text, delete_password } = req.body
      const board = req.body.board || req.params.board

      const thread = {
         board,
         text,
         delete_password,
         bumped_on: new Date(),
         reported: false,
         replies: []
      }

      const newThread = new Thread(thread)
      await newThread.save()

      res.redirect(`/b/${board}`)

   } catch (err) { 
      console.error(err) 
      return res.status(200)
         .json(typeof err === 'string' ? err : 'error has occured')
   }
}



exports.getThreads = async (req, res, next) => {
   try {
      const board = req.params.board
      
      const threads = await Thread.find({ board })
         .populate({ 
            path: 'replies', 
            options: { limit: 3, $sort: { updated_on: -1 } } 
         })
         .sort({ bumped_on: -1 })
         .limit(10)
 
      const repliesCount = await Thread.aggregate([
         { $match: { board } },
         { $project: { replycount: { $size: "$replies" } } }
      ])
      const repCount = {}
      repliesCount.forEach(r => repCount[r._id.toString()] = r.replycount )
                     
      const formatedThreads = threads.map(t => {
         const formatReplies = t.replies.map(r => {
            const { createdAt, updatedAt, ...rest } = r.toObject()
            return { ...rest, created_on: createdAt, updated_on: updatedAt }
         })         
         const id = t._id.toString()
         return {
            _id: t._id,
            text: t.text,
            bumped_on: t.bumped_on,
            replies: formatReplies,
            created_on: t.createdAt, 
            updated_on: t.updated_on, 
            replycount: repCount[id],
            hiddencount: repCount[id] > 3 ? repCount[id] - 3 : 0
         } 
      })
      
      res.status(200).json(formatedThreads)

   } catch (err) { 
      console.error(err) 
      return res.status(200)
         .json(typeof err === 'string' ? err : 'error has occured')
   }
}



exports.getThread = async (req, res, next) => {
   try {
      const _id = req.query.thread_id

      const thread = await Thread.findOne({ _id })
         .populate({ path: 'replies', options: { $sort: { updated_on: -1 } } })
      if (!thread) { throw 'thread not found' }

      const { 
         createdAt, 
         updatedAt, 
         replies, 
         reported, 
         delete_password, 
         ...restThread 
      } = thread.toObject()

      const formatedReplies = replies.map(r => {
         const { createdAt, updatedAt, reported, delete_password, ...rest } = r
         return { ...rest, created_on: createdAt, updated_on: updatedAt }
      })

      const formatedThread = { 
         ...restThread, 
         replies: formatedReplies,
         created_on: createdAt, 
         updated_on: updatedAt 
      }

      res.status(200).json(formatedThread) 

   } catch (err) { 
      console.error(err) 
      return res.status(200)
         .json(typeof err === 'string' ? err : 'error has occured')
   }
}



exports.deleteThread = async (req, res, next) => {
   try {
      const { thread_id, delete_password } = req.body

      const thread = await Thread.findOne({ _id: thread_id })
      if (!thread) { throw 'Could not find thread to delete' }
      if (thread.delete_password !== delete_password) { throw 'incorrect password' }

      const deleteThreadResult = await Thread.deleteOne({ _id: thread_id })
      if (!deleteThreadResult.ok) { throw 'failed to delete thread' }

      if (thread.replies.length >= 1) {
         await Reply.deleteMany({ _id: { $in: thread.replies } })
      }

      return res.status(200).type('text').send('success')
   } catch (err) { 
      console.error(err) 
      return res.status(200).type('text')
         .send(typeof err === 'string' ? err : 'error has occured')
   }
}



exports.reportThread = async (req, res, next) => {
   try {
      const board = req.params.board
      const thread_id = req.body.thread_id

      const thread = await Thread
         .updateOne({ _id: thread_id, board }, { reported: true })
      if (!thread.ok) { throw 'unable to report thread' }  

      return res.status(200).type('text').send('reported')
   } catch (err) { 
      console.error(err) 
      return res.status(200).type('text')
         .send(typeof err === 'string' ? err : 'error has occured')
   }
}