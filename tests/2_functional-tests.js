/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

   chai.use(chaiHttp);

suite('Functional Tests', function() {
   const board = 'test'
   let threads

   suite('API ROUTING FOR /api/threads/:board', function() {

      suite('POST', function() {
         test('create two threads', done => {
            chai.request(server)
               .post(`/api/threads/${board}`)               
               .send({ text:'first thread', delete_password: 'delete', board })
               .end((err, res) => {
                  assert.equal(res.status, 200)
                 // done()
               })
               chai.request(server)
                  .post(`/api/threads/${board}`)               
                  .send({ text:'second thread', delete_password: 'delete', board })
                  .end((err, res) => {
                     assert.equal(res.status, 200)
                     done()
                  })   
         }) 
      });
      
      suite('GET', function() {
         test('recent 10 threads with most recent 3 replies each', done => {
            chai.request(server)
               .get(`/api/threads/${board}`)               
               .send({ board })
               .end((err, res) => {
                  assert.equal(res.status, 200)
                  assert.isArray(res.body)
                  assert.isBelow(res.body.length, 11)                  
                  assert.property(res.body[0], '_id')
                  assert.property(res.body[0], 'created_on')
                  assert.property(res.body[0], 'bumped_on')
                  assert.property(res.body[0], 'text')
                  assert.property(res.body[0], 'replies')
                  assert.notProperty(res.body[0], 'reported')
                  assert.notProperty(res.body[0], 'delete_password')
                  assert.isArray(res.body[0].replies)
                  assert.isBelow(res.body[0].replies.length, 4)
                  threads = res.body
                  done()
               })
         })         
      });
      
      suite('DELETE', function() {
         test('delete thread with good password', done => {
            chai.request(server)
               .delete(`/api/threads/${board}`)               
               .send({ board, thread_id: threads[0]._id, delete_password: 'delete' })
               .end((err, res) => {
                  assert.equal(res.status, 200)
                  assert.equal(res.text, 'success')
                  done()
               })
         }) 
         test('delete thread with bad password', done => {
            chai.request(server)
               .delete(`/api/threads/${board}`)               
               .send({ board, thread_id: threads[1]._id, delete_password: 'bad-password' })
               .end((err, res) => {
                  assert.equal(res.status, 200)
                  assert.equal(res.text, 'incorrect password')
                  done()
               })
         }) 
      });
      
      suite('PUT', function() {
         test('report thread', done => {
            chai.request(server)
               .put(`/api/threads/${board}`)
               .send({ board, thread_id: threads[1]._id })
               .end((err, res) => {
                  assert.equal(res.status, 200)
                  assert.equal(res.text, 'reported')
                  done()
               })
         }) 
      });
      

   });
   
   suite('API ROUTING FOR /api/replies/:board', function() {
      
      suite('POST', function() {
         test('reply to thread', done => {
            chai.request(server)
               .post(`/api/replies/${board}`)
               .send({ 
                  board, 
                  thread_id: threads[1]._id, 
                  text: 'a reply', 
                  delete_password: 'delete' 
               })
               .end((err, res) => {
                  assert.equal(res.status, 200)
                  done()
               })
         }) 
      });
      let reply_id
      suite('GET', function() {
         test('get replies for one thread', done => {
            chai.request(server)
               .get(`/api/replies/${board}`)
               .query({ thread_id: threads[1]._id })
               .end((err, res) => {
                  assert.equal(res.status, 200)
                  assert.property(res.body, '_id')
                  assert.property(res.body, 'created_on')
                  assert.property(res.body, 'bumped_on')
                  assert.property(res.body, 'text')
                  assert.property(res.body, 'replies')
                  assert.notProperty(res.body, 'reported')
                  assert.notProperty(res.body, 'delete_password')
                  assert.isArray(res.body.replies)
                  assert.notProperty(res.body.replies[0], 'delete_password')
                  assert.notProperty(res.body.replies[0], 'reported')
                  assert.equal(res.body.replies[res.body.replies.length - 1].text, 'a reply')
                  reply_id = res.body.replies[res.body.replies.length - 1]._id 
                  done()
               })  
         })         
      });
      
      suite('PUT', function() {
         test('report thread', done => {
            chai.request(server)
               .put(`/api/replies/${board}`)
               .send({ board, thread_id: threads[1]._id, reply_id })
               .end((err, res) => {
                  assert.equal(res.status, 200)
                  assert.equal(res.text, 'reported')
                  done()
               })
         }) 
      });
      
      suite('DELETE', function() {
         test('delete reply', done => {
            chai.request(server)
               .delete(`/api/replies/${board}`)
               .send({ 
                  board, 
                  thread_id: threads[1]._id, 
                  reply_id, 
                  delete_password: 'delete' 
               })
               .end((err, res) => {
                  assert.equal(res.status, 200)
                  assert.equal(res.text, 'success')
                  done()
               })
         }) 
      });
      
   });

});