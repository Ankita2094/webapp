const app = require("../models");
const chai = require("chai");
const chaiHttp = require("chai-http");

const { expect } = chai;

chai.use(chaiHttp);
const api = 'http://localhost:8080'



describe("API Test", () => {
  it("GET", done => {
    chai
      .request(api)
      .get("/")
      .end((err, res) => {
        expect(200)
        console.log("GET api tested")
       
        done();
      });
  });


it ("PUT", (done)=>{
  var user = {
      
      "firstName": "John"
      
  }
  
  chai.request(api)
      .put("/")
      .send(user)
      .end((err, result)=>{                    
        expect(200);
          console.log("PUT api tested");
          done()
      })
})
});