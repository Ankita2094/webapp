const { select } = require("async");
const db = require("../models");
const bcrypt = require("bcrypt");
const Users = db.users;
const Question = db.questions;
const Category = db.categories;
const Answer = db.answers;
const Op = db.Sequelize.Op;
const helper = require('./user.helper');
const authenticate = require('./basicauth.authorization');
const v4 = require('uuidv4');
const SDC = require('statsd-client');
const logger = require('../logger');
const dbConfig = require('../dbConfig');
const fileService = require('./file.auth');
const s3 = require('./file.controller').s3;
const sdc = new SDC({host: 'localhost', port: 8125});
const AWS = require('aws-sdk');
require('dotenv').config();


AWS.config.update({region: process.env.AWS_REGION});
const sns = new AWS.SNS({apiVersion: '2010-03-31'});
// Create User
exports.create = (req, res) => {

    let start = Date.now();
    logger.info("User CREATE Call");
    sdc.increment('User_http_POST');
  // Validate request
  if (!req.body.emailAddress || !req.body.firstName || !req.body.lastName || !req.body.password) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    logger.error("Content can not be empty!");
    return;
  }

  // Create a user
  const user = {
    emailAddress: req.body.emailAddress,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    password: req.body.password
  };

  // Save user in the database
  let start1 = Date.now();
    logger.info("User DB Call");
    sdc.increment('QueryToDB');
  Users.create(user)
    .then(data => {
        let temp = data.toJSON();
                            delete temp.password;
                            res.status(201).send(temp);

                            logger.info("User has been created..!");
                            let end = Date.now();
                            var elapsed = end - start;
                            sdc.timing('timer.User_http_POST', elapsed);
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Internal Server Error"
      });
      logger.error(err.message);
    });
    let end1 = Date.now();
    var elapsed1 = end1 - start1;
    sdc.timing('QueryToDB', elapsed1);
};



exports.findOne = (req, res) => {
  //  const id = req.params.id;

  let start = Date.now();
  logger.info("User FIND Call");
  sdc.increment('User_http_GET');

  var authHeader = req.headers.authorization;
  console.log(authHeader);
  if(!authHeader){
      

      res.setHeader('WWW-Authenticate','Basic');
      var err = new Error('You are not authenticated')
       err.status = 'Not Authenticated'
      //  next(err)
      res.status(500).send({
        message : err
      })
      logger.error(err);
  }

  var auth = new Buffer(authHeader.split(' ')[1], 'base64').toString().split(':')
  var username = auth[0]
  console.log(username);
  
  var password = auth[1]
  console.log(password);

  let start1 = Date.now();
    logger.info("Find User DB Call");
    sdc.increment('QueryToDB');
  Users.findAll({attributes:['id','password','emailAddress','firstName','lastName','createdAt','updatedAt'],where: {'emailAddress':username}}).then(data =>{
    // res.send(data)
    // console.log(data);
    var cryptpwd = data[0].dataValues['password'];
    var email = data[0].dataValues['emailAddress'];
    console.log(email);
    bcrypt.compare(password,cryptpwd, function(err, result) {
    // console.log(result);
    // res.send(data);
    if(username == email && result){
          // console.log(emailAddress);
          res.send(data);

          logger.info("User Authorized..!");

        //   user = user.toJSON();
        //   delete user.password;
        //   res.status(200).send(user);
  
          logger.info("Self Information Retrived..!");
          let end = Date.now();
          var elapsed = end - start;
          sdc.timing('timer.User_http_GET', elapsed);
          // next();
      }else{
          var err = new Error('You are not authenticated')
      
          var err = new Error('You are not authenticated')
          res.status(500).send({
            message: "Error getting User" +err });

            logger.error("Error getting user");
          }

     
  });


    console.log("onlypwd:");
    console.log(cryptpwd);
  })
  let end1 = Date.now();
    var elapsed1 = end1 - start1;
    sdc.timing('QueryToDB', elapsed1);

};



// Update User
exports.update = (req, res) => {

    let start = Date.now();
    logger.info("User UPDATE Call");
    sdc.increment('User_http_PUT');

  var authHeader = req.headers.authorization;
  console.log(authHeader);
  if(!authHeader){
      var err = new Error('You are not authenticated')

      res.setHeader('WWW-Authenticate','Basic');
      err.status = 401
       next(err)
      res.status(500).send({
        message : err
      })
      logger.error(err);
  }

  var auth = new Buffer(authHeader.split(' ')[1], 'base64').toString().split(':')
  var username = auth[0]
  console.log(username);
  
  var password = auth[1]
  console.log(password);
  let start1 = Date.now();
  logger.info("Update User DB Call");
  sdc.increment('QueryToDB');
  Users.findAll({attributes:['id','password','emailAddress','firstName','lastName','createdAt','updatedAt'],where: {'emailAddress':username}}).then(data =>{
    // res.send(data)
    // console.log(data);
    var cryptpwd = data[0].dataValues['password'];
    console.log("onlypwd:");
    console.log(cryptpwd);
    var email = data[0].dataValues['emailAddress'];
    console.log("email : "+email);
    bcrypt.compare(password,cryptpwd, function(err, result) {
     
      if(username == email && result){
        console.log(req.body);
        var em = req.body["emailAddress"];
        var cat = req.body["createdAt"];
        var uat = req.body["updatedAt"];
        console.log(em);
        if(em === undefined && cat === undefined && uat === undefined){
        Users.update(req.body, {where: { 'emailAddress': username }}
        )
            .then(num => {
              if (num == 1) {
                res.send({
                  message: "User was updated successfully."
                });
                logger.error("User was updated successfully");
              } else {
                res.send({
                  message: `Cannot update User`
                });
                logger.error("Cannot Update User");
              }
            })
            .catch(err => {
              res.status(500).send({
                message: "Error updating User" 
              });
              logger.error("Error updating User");
            });
        // next();
          }
          else{
            var err = new Error('500')
            res.status(500).send({
              message: "Error updating User" +err
            });
            logger.error("Error updating user" +err);
        }
    }else{
        var err = new Error('500')
        res.status(500).send({
          message: "Error updating User" +err
        });
        logger.error("Error updating user" +err);
    }
 
  });

  logger.info("User Information has been updated..!");
  let end = Date.now();
  var elapsed = end - start;
  sdc.timing('timer.User_http_PUT', elapsed);

  })
  let end1 = Date.now();
    var elapsed1 = end1 - start1;
    sdc.timing('QueryToDB', elapsed1);

};

//Find User unauth

exports.findUser =  (req, res) => {

    let start = Date.now();
    logger.info("User GET Call");
    sdc.increment('User_http_GET');
const id = req.params.id;
let start1 = Date.now();
logger.info("Find One User DB Call");
sdc.increment('QueryToDB');
  Users.findOne({
    where: {
        id: id
    }
}).then(data => {
    res.send(data)
    logger.info("User Information Retrived..!");
    let end = Date.now();
    var elapsed = end - start;
    sdc.timing('timer.User_http_GET', elapsed);
}).catch(err => {
    res.status(500).send({
      message:
        err.message || "Cannot Find User | Error"
    });
    logger.error("Cannot Find User | Error");
  });
  let end1 = Date.now();
  var elapsed1 = end1 - start1;
  sdc.timing('QueryToDB', elapsed1);

}

// Question

exports.createQuestion = async (req, res) => {

    let start = Date.now();
    logger.info("Question POST Call");
    sdc.increment('Question_http_POST');

  let user = await authenticate.checkAuthorization(req, res, Users);

  if(user){

      if(req.body.question_text){
          let category = req.body.categories;
          if(category.length === 0 || !category){

              let question = await Question.create({
                  question_id: v4.uuid(),
                  question_text: req.body.question_text
          
              });
              
              await user.addQuestion(question);
              await question.setCategories([]);
          
              const result = await helper.qById(question.question_id);
          
              res.status(201).send(result.toJSON());
              logger.info("Question Created");
              let end = Date.now();
                var elapsed = end - start;
                sdc.timing('timer.Question_http_POST', elapsed);

          }

          let empty = await helper.categoryPresent(req, res, category);

          if(empty){
              for(let i=0; i<category.length; i++){
                  let cat = category[i];
                  let catval = cat.category.toLowerCase();
              
                  let validCat = await helper.checkvalidCat(catval);

                  if(validCat){

                      let [category, created] = await Category.findOrCreate({
                          where: {category: catval}, 
                          defaults: {category_id: v4.uuid()}
                      });

                      helper.createNewQuestion(req, res, user, category);
                  } else {

                      res.status(400).send({
                          message: "Special characters not allowed"
                      });
                      logger.error("Special Characters not allowed");
                  }  
              }
          }   
      } else {

          res.status(400).send({
              message: "Please Enter Question Text."
          });
          logger.error("Please Enter Question Text.");
      } 
  }
}


exports.deleteQuestion = async (req, res) => {

    let start = Date.now();
    logger.info("Question DELETE Call");
    sdc.increment('Question_http_DELETE');

  let user = await authenticate.checkAuthorization(req, res, Users);

  if(user){

      const question = await helper.qById(req.params.question_id);

      if(question){
          if(question.userId === user.id){

              let answers = await question.getAnswers();

              if(answers.length !== 0){

                  res.status(400).send({
                      message: "Cannot Delete answer present"
                  });
                  logger.info("Cannot Delete Answer Present");

              } else {

                let question_attachments = await question.getAttachments();

                question_attachments.forEach(async element => {
                    await fileService.questionDeleteFile(element, s3, question);
                });

                  let result = await Question.destroy({ where: {question_id: question.question_id} });

                  if(result){
                      res.status(204).send();
                      let end = Date.now();
                      var elapsed = end - start;
                      sdc.timing('timer.Question_http_DELETE', elapsed);
                  } else {
                      res.status(500).send({
                        message: "Status 500"}
                      );
                      logger.info("Status 500");
                  }
              }
          } else {

              res.setHeader('WWW-Authenticate', 'Basic realm="example"');
              res.status(401).send({
                  message: "Not Authenticated to delete the question"
              });
              logger.error("Not Authenticated to delete the question");
          }
      } else {

          res.status(404).send({
              message: "No such Question"
          });
          logger.error("No Such Question");
      }
  }
}

exports.getOneQuestion = async (req, res) => {

    let start = Date.now();
    logger.info("Questions GET Call");
    sdc.increment('Question_http_GET');

  const question = await helper.qById(req.params.question_id);

  if(question){
      res.status(200).send(question);
      let end = Date.now();
      var elapsed = end - start;
      sdc.timing('timer.Question_http_GET', elapsed);
  } else {
      res.status(404).send({
          message: "No Such Question"
      })
      logger.error("No Such Question");
  }
}

exports.updateQuestion = async (req, res) => {

    let start = Date.now();
    logger.info("Question UPDATE Call");
    sdc.increment('Question_http_PUT');

  let user = await authenticate.checkAuthorization(req, res, Users);

  if(user){

      const question = await helper.qById(req.params.question_id);

      if(question){
          if(question.userId === user.id){

              let question_text = req.body.question_text;
              let categories = req.body.categories;

              if(!question_text && !categories){

                  res.status(400).send({
                      message: "Question text and/or Categories required"
                  });
                  logger.error("Question text and/or categories required");
      
              } else {

                  if(!question_text){

                      if(typeof question_text === typeof ""){
                  
                          res.status(400).send({
                              message: "Question text empty,please provide"
                          });
                          logger.error("Question text empty please provide");

                          return;
                      } 
                  } else {
                      question.question_text = question_text;
                  }

                  if(!(typeof categories === typeof undefined)){

                      let empty = await helper.categoryPresent(req, res, categories);

                      if(empty){
                          await question.setCategories([]);
                          for(let i=0; i<categories.length; i++){
      
                              let inputCategory = categories[i];
                              let value = inputCategory.category.toLowerCase();
                  
                              let [category, created] = await Category.findOrCreate({
                                  where: {category: value}, 
                                  defaults: {category_id: v4.uuid()}
                              })
                  
                              await question.addCategory(category);       
                          }
                      }
                  }

                  await question.save();

                  res.status(204).send({
                      message: "Updated Successfully!"
                  });
                  logger.info("Updated Successfully");
                  let end = Date.now();
                  var elapsed = end - start;
                  sdc.timing('timer.Question_http_PUT', elapsed);
              }

          } else {

              res.setHeader('WWW-Authenticate', 'Basic realm="example"');
              res.status(401).send({
                  message: "Unauthenticated to update"
              });
              logger.error("unauthenticated to update");
          }
      } else {

          res.status(404).send({
              message: "No Such Question"
          });
          logger.error("No Such Question");
      }
  }
}

exports.getAllQuestions = async (req, res) => {

    let start = Date.now();
    logger.info("Questions GET Call");
    sdc.increment('Question_http_GET');
    console.log("in get all que");

  const questions = await helper.getAllQuestions();

  res.status(200).send(questions);

  
              let end = Date.now();
                var elapsed = end - start;
                sdc.timing('timer.Question_http_GET', elapsed);

}

// Answer 
exports.createAnswer = async (req, res) => {

    let start = Date.now();
    logger.info("ANSWER POST Call");
    sdc.increment('Answer_http_POST');

        console.log(req.params.questionID);
        console.log("this" +req.params.question_id);
  let user = await authenticate.checkAuthorization(req, res, Users);
  if(user){
      if(req.body.answer_text){

          const question = await helper.qById(req.params.question_id);
        console.log(req.params.question_id);
          if(question){

            let start1 = Date.now();
            logger.info("Answer create DB Call");
            sdc.increment('QueryToDB');
              
              let answer = await Answer.create({
                  answer_id: v4.uuid(),
                  answer_text: req.body.answer_text
              });

              let end1 = Date.now();
            var elapsed1 = end1 - start1;
            sdc.timing('QueryToDB', elapsed1);

              await question.addAnswer(answer);
              await user.addAnswer(answer);
              const answerIs = await helper.getansById(answer.answer_id);
            //   res.status(201).send(answerIs.toJSON());
              let end = Date.now();
                  var elapsed = end - start;
                  sdc.timing('timer.Answer_http_POST', elapsed);
              
                //   const result = await helper.getansById(answer.answer_id, req.params.questionID);
                  const qUser = await Users.findOne({ where: { id: question.userId }})
                  logger.info(qUser);
  
                  const content = {

                    
                      ToAddresses: qUser,
                      userDetails: user,
                      questionDetails: question,
                      answerDetails: answer,
                      questionAPI: process.env.AWS_ENVIORMENT+"."+process.env.DOMAIN_NAME+"/v1/question/"+question.question_id,
                      answerAPI: process.env.AWS_ENVIORMENT+"."+process.env.DOMAIN_NAME+"/v1/question/"+question.question_id+"/answer/"+answer.answer_id,
                      type: "POST"
  
                  }
                  logger.info("message content:");
                  logger.info(content);
                  const params = {
  
                      Message: JSON.stringify(content),
                      TopicArn: process.env.AWS_TOPIC_ARN}
                    
                  let publishTextPromise = sns.publish(params).promise();
  
                  publishTextPromise.then(
                      function(content) {
  
                          logger.info(`TopicARN: ${params.TopicArn}`);
                          logger.info("ID:  " + content.MessageId);
                          res.status(201).send(answerIs.toJSON());
                          logger.info("Question is Answered..!");
  
                      }).catch(
                      function(err) {
  
                          console.error(err, err.stack);
                          res.status(500).send(err)
                      }); 
          } else {      
              res.status(404).send({
                  message: "No such questions"
              });
              logger.error("No Such Question");
          }
      } else {

          res.status(400).send({
              message: "Please provide Answer"
          });
          logger.error("Please provide answer");
      }
  } 
}


exports.updateAnswer = async (req, res) => {

    let start = Date.now();
    logger.info("ANSWER PUT Call");
    sdc.increment('Answer_http_PUT');

  let user = await authenticate.checkAuthorization(req, res, Users);

  if(user){

      const question = await helper.qById(req.params.question_id);

      if(question){

          const answer = await helper.getansById(req.params.answer_id, req.params.question_id);
          if(answer){
              if(answer.userId === user.id){     
                  
                  let answer_text = req.body.answer_text;
  
                  if(answer_text){
                      answer.answer_text = answer_text;

                      await answer.save();
  
                    //   res.send({
                    //       message: "Updated Successfully!"
                    //   });
                      logger.info("Updated Successfully");
                      let end = Date.now();
                     var elapsed = end - start;
                    sdc.timing('timer.Answer_http_PUT', elapsed);


                    const qUser = await Users.findOne({ where: { id: question.userId }})
                    const content = {

                        ToAddresses: qUser,
                        userDetails: user,
                        questionDetails: question,
                        AnswerText: req.body.answer_text,
                        answerDetails: answer,
                        questionAPI: process.env.AWS_ENVIORMENT+"."+process.env.DOMAIN_NAME+"/v1/question/"+question.question_id,
                        answerAPI: process.env.AWS_ENVIORMENT+"."+process.env.DOMAIN_NAME+"/v1/question/"+question.question_id+"/answer/"+answer.answer_id,
                        type: "UPDATE"

                    }
                    const params = {

                        Message: JSON.stringify(content),
                        TopicArn: process.env.AWS_TOPIC_ARN

                    }

                    let publishTextPromise = sns.publish(params).promise();

                    publishTextPromise.then(
                        function(content) {

                            console.log(`TopicARN ${params.TopicArn}`);
                             console.log("MessageID:  " + content.MessageId);
                            res.status(204).send()
                            res.status(204).send({ message: "Updated Successfully!" });
                            logger.info("Updated Successfully!");

                        }).catch(
                        function(err) {
                            console.error(err, err.stack);
                            res.status(500).send(err);

                        });
                  } else {

                      res.status(400).send({
                          message: "Please Enter Answer"
                      });
                      logger.error("Please enter Answer");  
                  }
              } else {    
                  res.setHeader('WWW-Authenticate', 'Basic realm="example"');
                  res.status(401).send({
                      message: "Unauthenticated "
                  });
                  logger.error("Unauthenticated");
              }
          } else {
              res.status(404).send({
                  message: "No Answer"
              });
              logger.error("No Answer");
          }
      } else {

          res.status(404).send({
              message: "No such Question"
          });
          logger.error("No Such Question");
      }
  }
}

exports.getAnswer = async (req, res) => {

    let start = Date.now();
    logger.info("ANSWER GET Call");
    sdc.increment('Answer_http_GET');
console.log("in the get answer");

  const question = await helper.qById(req.params.question_id);
  if(question){
      const answer = await helper.getansById(req.params.answer_id, req.params.question_id);

      if(answer){
          res.status(200).send(answer);
          let end = Date.now();
          var elapsed = end - start;
          sdc.timing('timer.Answer_http_GET', elapsed);
      } else {
          res.status(404).send({
              message: "No Answer"
          });
          logger.error("No Answer");
      }
  } else {
      res.status(404).send({
          message: "No such Question"
      });
      logger.error("No Such Question");
  }
}

exports.deleteAnswer = async (req, res) => {

    let start = Date.now();
    logger.info("ANSWER DELETE Call");
    sdc.increment('Answer_http_DELETE');

  let user = await authenticate.checkAuthorization(req, res, Users);

  if(user){

      const question = await helper.qById(req.params.question_id);

      if(question){

          const answer = await helper.getansById(req.params.answer_id, req.params.question_id);

          if(answer){
              if(answer.userId === user.id){

                let attachments = await answer.getAttachments();
                    attachments.forEach(async element => {
                        await fileService.answerDeleteFile(element, s3, answer);
                    });
                  let result = await Answer.destroy({ where: {answer_id: answer.answer_id} });

                  if(result){
                    //   res.status(204).send({
                    //       message: "Answer Deleted"
                    //   });
                    //   logger.info("ANSWER Deleted");
                      let end = Date.now();
                     var elapsed = end - start;
                    sdc.timing('timer.Answer_http_DELETE', elapsed);
                    const qUser = await Users.findOne({ where: { id: question.userId }})

                        const content = {

                            ToAddresses: qUser,
                            userDetails: user,
                            questionDetails: question,
                            answerDetails: answer,
                            questionAPI: process.env.AWS_ENVIORMENT+"."+process.env.DOMAIN_NAME+"/v1/question/"+question.question_id,
                            answerGetAPI: process.env.AWS_ENVIORMENT+"."+process.env.DOMAIN_NAME+"/v1/question/"+question.question_id+"/answer/"+answer.answer_id,
                            type: "DELETE"

                        }

                        const params = {
                            Message: JSON.stringify(content),
                            TopicArn: process.env.AWS_TOPIC_ARN

                        }
                        let publishTextPromise = sns.publish(params).promise();
                        publishTextPromise.then(
                            function(content) {
                                console.log(`TopicARN ${params.TopicArn}`);
                                console.log("Message ID: " + content.MessageId);
                                res.status(204).send();
                                logger.info("Answer Deleted..!");

                            }).catch(

                            function(err) {
                                console.error(err, err.stack);
                                res.status(500).send(err);

                            });              
                  } else {
                      res.status(500).send(
                          {message: "Internal Error "}
                      );
                      logger.error("Internal Error");
                  }

              } else {
                  
                  res.setHeader('WWW-Authenticate', 'Basic realm="example"');
                  res.status(401).send({
                      message: "Unauthenticated"
                  });
                  logger.error("Unauthenticated");
              }
          } else {
  
              res.status(404).send({
                  message: "No Answer"
              });
              logger.error("No Answer");
          }
      } else {

          res.status(404).send({
              message: "No such Question"
          });
          logger.error("No Such Question");
      }
  } 
}