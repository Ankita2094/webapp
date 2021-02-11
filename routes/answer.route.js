// module.exports = app => {
//     const db = require("../models");
//     const Users = db.users;
//       const users = require("../controller/users.controller.js");
//       const fileController = require('../controller/file.controller');
  
  
  
//     var ansroute = require("express").Router();
      
    
//       ansroute.post("/v1/question/:question_id/answer", users.createAnswer);
      
//       ansroute.delete("/v1/question/:question_id/answer/:answer_id", users.deleteAnswer);
//       ansroute.put("/v1/question/:question_id/answer/:answer_id", users.updateAnswer);
//       ansroute.get("/v1/question/:question_id/answer/:answer_id", users.getAnswer);
      
      
//         app.use(ansroute);
//     };


const express = require('express');
const users = require("../controller/users.controller.js");
const router = express.Router();

//Post a Question's Answer
router.post("/:question_id/answer", users.createAnswer);

//Get a Question's Answer
router.get("/:question_id/answer/:answer_id", users.getAnswer);

//Delete a Question's Answer
router.delete("/:question_id/answer/:answer_id", users.deleteAnswer);

//Update a Question's Answer
router.put("/:question_id/answer/:answer_id", users.updateAnswer);

module.exports = router;
  