const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);
const url = "/api/issues/apitest";

suite('Functional Tests', function() {
    test("Create an issue with every field",(done)=>{
        chai.request(server)
            .keepOpen()
            .post(url)
            .send({
                "issue_text": "2 issue",
                "issue_title": "1 test",
                "created_by": "Prosper39",
                "assigned_to": "Moi",
                "status_text": "Moi",
            })
            .end((err,res) =>{
                assert.equal(res.status,200);
                assert.hasAllKeys(JSON.parse(res.text),[
                    "_id", "issue_title", "issue_text", "created_by", "assigned_to", "status_text" ,"open","updated_on", "created_on"
                ])
                done();
            })
  })

  test("Create an issue with only required fields",(done)=>{
        chai.request(server)
            .keepOpen()
            .post(url)
            .send({
                issue_title:"First test",
                issue_text:"First issue",
                created_by:"Prosper"
            })
            .end((err,res) =>{
                assert.equal(res.status,200);
                assert.hasAllKeys(JSON.parse(res.text),[
                    "_id", "issue_title", "issue_text", "created_by", "assigned_to", "status_text" ,"open","updated_on", "created_on"
                ])
                done();
            })
  })

  test("Create an issue with missing required fields",(done)=>{
        chai.request(server)
            .keepOpen()
            .post(url)
            .send({
                issue_title:"First test",
                created_by:"Prosper"
            })
            .end((err,res) =>{
                assert.deepEqual(JSON.parse(res.text),{ error: 'required field(s) missing' })
                done();
            })
  })


  test("View issues on a project",(done) =>{
    chai.request(server)
        .keepOpen()
        .get(url)
        .end((err,res)=>{
            assert.equal(res.status,200);
            assert.isTrue(Array.isArray(JSON.parse(res.text)));
            done();
        })
  })

  test("View issues on a project with one filter", (done) =>{
    chai.request(server)
        .keepOpen()
        .get(`${url}?open=true`)
        .end((err,res) =>{
            const issues = JSON.parse(res.text);
            issues.forEach(element => {
               assert.isTrue(element.open)
            });
            done();
        })
  })


  test("View issues on a project with multiple filters", (done) =>{
    chai.request(server)
        .keepOpen()
        .get(`${url}?open=true&assigned_to=moi`)
        .end((err,res) =>{
            const issues = JSON.parse(res.text);
            issues.forEach(element => {
               assert.isTrue(element.open);
               assert.equal(element.assigned_to,"moi")
            });
            done();
        })
  })


  test("Update one field on an issue", (done) =>{
    chai.request(server)
        .keepOpen()
        .put(url)
        .send({
            _id:"8820910c-6d61-430c-960c-373084cfd9e2",
            assigned_to:"PROSPERRRR"
        })
        .end((err,res) =>{
            const issue = JSON.parse(res.text);
            assert.deepEqual(issue,{  result: 'successfully updated', '_id': "8820910c-6d61-430c-960c-373084cfd9e2" })
            done();
        })
  })


  test("Update multiple fields on an issue", (done) =>{
    chai.request(server)
        .keepOpen()
        .put(url)
        .send({
            _id:"8820910c-6d61-430c-960c-373084cfd9e2",
            assigned_to:"PROSPERRRR",
            status_text:"Rezero"
        })
        .end((err,res) =>{
            const issue = JSON.parse(res.text);
            assert.deepEqual(issue,{  result: 'successfully updated', '_id': "8820910c-6d61-430c-960c-373084cfd9e2" })
            done();
        })
  })


  test("Update an issue with missing _id", (done) =>{
    chai.request(server)
        .keepOpen()
        .put(url)
        .send({
            assigned_to:"PROSPERRRR",
            status_text:"Rezero"
        })
        .end((err,res) =>{
            const issue = JSON.parse(res.text);
            assert.deepEqual(issue,{ error: 'missing _id' })
            done();
        })
  })


  test("Update an issue with no fields to update", (done) =>{
    chai.request(server)
        .keepOpen()
        .put(url)
        .send({
            _id:"8820910c-6d61-430c-960c-373084cfd9e2"
        })
        .end((err,res) =>{
            const issue = JSON.parse(res.text);
            assert.deepEqual(issue,{ error: 'no update field(s) sent', '_id': "8820910c-6d61-430c-960c-373084cfd9e2" })
            done();
        })
  })

  test("Update an issue with an invalid _id", (done) =>{
    chai.request(server)
        .keepOpen()
        .put(url)
        .send({
            _id:"blablabla id",
            assigned_to:"PROSPERRRR",
            status_text:"Rezero"
        })
        .end((err,res) =>{
            const issue = JSON.parse(res.text);
            assert.deepEqual(issue,{ error: 'could not update', '_id': "blablabla id"})
            done();
        })
  })

  test("Delete an issue", (done) =>{
    const _id = "7c030a91-5d93-4011-9608-cc76e085633f";
    chai.request(server)
        .keepOpen()
        .delete(url)
        .send({ _id })
        .end((err,res) =>{
            const issue = JSON.parse(res.text);
            assert.equal(res.status,200);
            assert.deepEqual(issue,{ result: 'successfully deleted', '_id': _id })
            done();
        })
  })

  
  test("Delete an issue with an invalid _id", (done) =>{
    const _id = "blablabla";
    chai.request(server)
        .keepOpen()
        .delete(url)
        .send({ _id })
        .end((err,res) =>{
            const issue = JSON.parse(res.text);
            assert.deepEqual(issue,{ error: 'could not delete', '_id': _id })
            done();
        })
  })


  
  test("Delete an issue with missing _id:", (done) =>{
    chai.request(server)
        .keepOpen()
        .delete(url)
        .send({ })
        .end((err,res) =>{
            const issue = JSON.parse(res.text);
            assert.deepEqual(issue,{ error: 'missing _id' })
            done();
        })
  })



});
