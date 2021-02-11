// module.exports = app => {
//     const db = require("../models");
//     const Users = db.users;
//       const users = require("../controller/users.controller.js");
      
  
  
//     var queroute = require("express").Router();
      
    
  
//     queroute.post("/", users.createQuestion);
    
//      queroute.get("/:question_id", users.getOneQuestion);
//     queroute.delete("/:question_id", users.deleteQuestion);
//     queroute.put("/:question_id", users.updateQuestion);
  
      
//         app.use("/v1/question",queroute);
//     };
  


const express = require('express');
const users = require("../controller/users.controller.js");
const router = express.Router();

//Post a Question
router.post('/', users.createQuestion);

//Get a Question
router.get('/:question_id', users.getOneQuestion);

//Delete a Question
router.delete('/:question_id', users.deleteQuestion);

//Update a Question
router.put('/:question_id', users.updateQuestion);

module.exports = router;