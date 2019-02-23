/*
*
*
*       Complete the API routing below
*
*
*/

'use strict'

const expect = require('chai').expect

const Thread = require('../models/threadSchema')
const { 
   createThread, 
   getThreads, 
   getThread, 
   deleteThread,
   reportThread 
} = require('../controllers/threads')
const { postReply, deleteReply, reportReply } = require('../controllers/replies')

const { 
   checkBoard, 
   checkPassword, 
   checkText, 
   check_id,
   validationErrors 
} = require('../middlewares/validation')


module.exports = function (app) {
  
   app.route('/api/threads/:board')
      .post(
         [checkBoard(), checkText(), checkPassword()], 
         validationErrors, 
         createThread
         )
      .get(checkBoard(), validationErrors, getThreads)   
      .put([checkBoard(), check_id('thread_id')], validationErrors, reportThread)
      .delete(
         [checkBoard(), check_id('thread_id'), checkPassword()], 
         validationErrors, 
         deleteThread
         )  

   app.route('/api/replies/:board')
      .post(
         [checkBoard(), checkText(), checkPassword(), check_id('thread_id')], 
         validationErrors, 
         postReply
         )
      .get([checkBoard(), check_id('thread_id')], validationErrors, getThread) 
      .put(
         [checkBoard(), check_id('thread_id'), check_id('reply_id')], 
         validationErrors, 
         reportReply
         )
      .delete(
         [checkBoard(), check_id('thread_id'), checkPassword(), check_id('reply_id')], 
         validationErrors, 
         deleteReply
      )
}