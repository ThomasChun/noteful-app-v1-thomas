'use strict';

const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');

const expect = chai.expect;

chai.use(chaiHttp);

describe('Express static', function () {

  it('GET request "/" should return the index page', function () {
    return chai.request(app)
      .get('/')
      .then(function (res) {
        expect(res).to.exist;
        expect(res).to.have.status(200);
        expect(res).to.be.html;
      });
  });

});

describe('404 handler', function () {

  it('should respond with 404 when given a bad path', function () {
    return chai.request(app)
      .get('/DOES/NOT/EXIST')
      .then(res => {
        expect(res).to.have.status(404);
      });
  });

});

describe('GET/api/notes', function() {

  it('should list note items of GET', function() {
    return chai
      .request(app)
      .get('/api/notes')
      .then(function(res) {
        expect(res.body).to.be.a('array');
        expect(res.body.length).to.be.equal(10);
        const expectedKeys = ['id', 'title', 'content'];
        res.body.forEach(function(item) {
          expect(item).to.be.a('object');
          expect(item).to.include.keys(expectedKeys);
        });
      });
  });

  it('should return `Not Found` for an incorrect query', function() {
    return chai
      .request(app)
      .get('/api/note')
      .then(function(res) {
        expect(res.body.message).to.be.equal('Not Found');
      });
  });
});

describe('GET /api/notes/:id', function() {

  it('should return correct note object with id, title and content for a given id', function() {
    return chai
      .request(app)
      .get('/api/notes')
      .then(function(res) {
        return chai.request(app).get(`/api/notes/${res.body[0].id}`);
      })
      .then(function(res) {
        expect(res.body.id).to.be.equal(1000);
        expect(res.body.title).to.be.equal('5 life lessons learned from cats');
        expect(res.body.content).to.be.equal('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.');
        expect(res).to.have.status(200);
      });
  });

  it('should respond with a 404 for an invalid id (/api/notes/DOESNOTEXIST)', function() {
    return chai
      .request(app)
      .get('/api/notes/DOESNOTEXIST')
      .then(function(res) {
        expect(res).to.have.status(404);
        expect(res.body.message).to.be.equal('Not Found');
      });
  });
});

describe('POST /api/notes', function(){
  
  it('should create and return a new item with location header when provided valid data', function(){
    const newItem = { title: 'test title', content: 'test content' };
    return chai
      .request(app)
      .post('/api/notes')
      .send(newItem)
      .then(function(res) {
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body).to.include.keys('title', 'content', 'id');
        expect(res.body.id).to.not.equal(null);
        expect(res.body).to.deep.equal(
          Object.assign(newItem, { id: res.body.id })
        );
      });
  });

  it('should return an object with a message property "Missing title in request body" when missing "title" field', function(){
    const newItem = { title: '', content: 'test content' };
    return chai
      .request(app)
      .post('/api/notes')
      .send(newItem)
      .then(function(res) {
        expect(res.body.message).to.be.equal('Missing `title` in request body');
        expect(res).to.have.status(400);
      });
  });
});

describe('PUT /api/notes/:id', function() {

  const updateData = { title: 'updated title', content: 'updated content' };
  it('should update and return a note object when given valid data', function(){
    return chai
      .request(app)
      .get('/api/notes')
      .then(function(res) {
        updateData.id = res.body[0].id;
        return chai
          .request(app)
          .put(`/api/notes/${updateData.id}`)
          .send(updateData);
      })
      .then(function(res) {
        expect(res).to.have.status(200);
        expect(res.body).to.deep.equal(
          Object.assign(updateData, { id: res.body.id })
        );
      });
  });

  it('should return an object with a message property "Missing title in request body" when missing "title" field', function(){
    const updateData = { title: '', content: 'updated content' };
    return chai
      .request(app)
      .get('/api/notes')
      .then(function(res) {
        updateData.id = res.body[0].id;
        return chai
          .request(app)
          .put(`/api/notes/${updateData.id}`)
          .send(updateData);
      })
      .then(function(res) {
        expect(res).to.have.status(400);
        expect(res.body.message).to.be.equal('Missing `title` in request body');
      });
  });

  it('should respond with a 404 for an invalid id (/api/notes/DOESNOTEXIST)', function(){
    return chai
      .request(app)
      .get('/api/notes/DOESNOTEXIST')
      .then(function(res) {
        expect(res).to.have.status(404);
        expect(res.body.message).to.be.equal('Not Found');

      });
  });
});

describe('DELETE /api/notes/:id', function() {
  it('should delete an item by id', function() {
    return chai
      .request(app)
      .get('/api/notes')
      .then(function(res) {
        return chai.request(app).delete(`/api/notes/${res.body[0].id}`);
      })
      .then(function(res) {
        expect(res).to.have.status(204);
      });
  });
});
