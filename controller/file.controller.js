const v4 = require('uuidv4');
const express = require('express');
const db = require('../models');
const authorize = require('./basicauth.authorization');
const helper = require('./user.helper');
const fileHelper = require('./file.auth');
const multer  = require('multer');
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');
const path = require('path');
const User = db.users;
const router = express.Router();
const fs = require('fs');
const SDC = require('statsd-client');
const logger = require('../logger');
const dbConfig = require('../dbConfig');

const sdc = new SDC({host: 'localhost', port: 8125});

AWS.config.update({
    
  region: process.env.AWS_REGION

});

const s3 = new AWS.S3();
const bucket = process.env.AWS_BUCKET_NAME;


const storage = multer.diskStorage({
    destination : 'uploads/',
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    },
    limits:{ fileSize: 3000000 }
});
const upload = multer({storage}); 


router.post('/:question_id/file', upload.single('image'), async (req, res) => {
    let start = Date.now();
    logger.info("Image POST Call");
    sdc.increment('File_http_POST');

    let user = await authorize.checkAuthorization(req, res, User);
    if(user){
        const question = await helper.qById(req.params.question_id);
        if(question){
            if(question.userId === user.id){
                if(!req.file){
                    res.status(400).send({
                        message: 'No File Uploaded!'
                    });
                    logger.info("No File Uploaded");
                }
                const types = /jpeg|jpg|png/;
                const ext = types.test( path.extname( req.file.originalname ).toLowerCase());
                const mime = types.test( req.file.mimetype );
                 if(!mime && !ext){
                    res.status(400).send({
                        message: 'Unsupported File Type'
                    });
                    logger.error("Unsupported file type");
                } else {
                    const file_id = v4.uuid();
                    const file_name = req.params.question_id + "/" + file_id + "/" + path.basename( req.file.originalname, path.extname( req.file.originalname ) ) + path.extname( req.file.originalname);
                    await fileHelper.questionUpload(req.file.path, file_name, s3, question, file_id, req, res);
                }
                fs.unlink(req.file.path, () => {});
            } else {
                res.status(403).send({
                    message: "Unauthorized to add image to this question."
                });
                logger.error("Unauthorized to add image to this question");
            }
        } else {
            res.status(404).send({
                message: "Question doesnot exists!"
            });
            logger.error("Question Does not exists");
        }
    }


                            let end = Date.now();
                            var elapsed = end - start;
                            sdc.timing('timer.File_http_POST', elapsed);
});


router.post('/:question_id/answer/:answer_id/file', upload.single('image'), async (req, res) => {

    let start = Date.now();
    logger.info("File post Call");
    sdc.increment('File_http_POST');

    let user = await authorize.checkAuthorization(req, res, User);

    if(user){

        const question = await helper.qById(req.params.question_id);

        if(question){

            const answer = await helper.getansById(req.params.answer_id, req.params.question_id);

            if(answer){

                if(answer.userId === user.id){

                    if(!req.file){
                        res.status(400).send({
                            message: 'No File Uploaded!'
                        });
                        logger.error("No File Uploaded");
                    }
                 
                    const types = /jpeg|jpg|png/;
                    const ext = types.test( path.extname( req.file.originalname ).toLowerCase());
                    const mime = types.test( req.file.mimetype );
    
                     if(!mime && !ext){
                        res.status(400).send({
                            message: 'Unsupported File Type'
                        });
                        logger.error("Unsupported file type");
                    } else {
    
                        const file_id = v4.uuid();

                        const file_name = req.params.answer_id + "/" + file_id + "/" + path.basename( req.file.originalname, path.extname( req.file.originalname ) ) + path.extname( req.file.originalname);

                        await fileHelper.answerUpload(req.file.path, file_name, s3, answer, file_id, req, res);
    
                    }
    
                    fs.unlink(req.file.path, () => {});
    
                } else {
    
                    res.status(403).send({
                        message: "Unauthorized to add image to this answer."
                    });
                    logger.error("Unauthorized to add image to this answer");
    
                }

            } else {
    
                res.status(404).send({
                    message: "Answer doesnot exists!"
                });
                logger.error("Answer does not exists");
    
            }

        } else {

            res.status(404).send({
                message: "Question doesnot exists!"
            });
            logger.error("Question does not exists");
        }
    }
    let end = Date.now();
    var elapsed = end - start;
    sdc.timing('timer.File_http_POST', elapsed);
});

router.delete('/:question_id/answer/:answer_id/file/:file_id', async (req, res) => {
    let start = Date.now();
    logger.info("File delete Call");
    sdc.increment('File_http_DELETE');

    let user = await authorize.checkAuthorization(req, res, User);

    if(user){

        const question = await helper.qById(req.params.question_id);

        if(question){

            const answer = await helper.getansById(req.params.answer_id, req.params.question_id);

            if(answer){

                if(answer.userId === user.id){

                    const file = await answer.getAttachments({ where: {file_id: req.params.file_id}});

                    if(file.length !== 0){

                        const new_file = file[0];

                        const result = await fileHelper.answerDelete(new_file, s3, answer, req.params.file_id, res);

                        if(result){
                        
                            res.status(204).send();
                            let end = Date.now();
                            var elapsed = end - start;
                            sdc.timing('timer.File_http_DELETE', elapsed);
    
                        } else {
    
                            res.status(500).send({
                                message: err
                             });
                             logger.error(err);
                        }

                    } else{

                        res.status(404).send({
                            message: "File doesnot exists!"
                        });
                        logger.error("File does not exists");

                    }

                } else {

                    res.status(403).send({
                        message: "Unauthorized to delete image to this answer."
                    });
                    logger.error("Unauthorized to delete image to this answer");

                }
            } else {
    
                res.status(404).send({
                    message: "Answer doesnot exists!"
                });
                logger.error("Answer does not exists");
    
            }


        } else {

            res.status(404).send({
                message: "Question doesnot exists!"
            });
            logger.error("Question does not exists");
        }
    }
});

router.delete('/:question_id/file/:file_id', async (req, res) => {

    let start = Date.now();
    logger.info("Image DELETE Call");
    sdc.increment('File_http_DELETE');

    let user = await authorize.checkAuthorization(req, res, User);

    if(user){

        const question = await helper.qById(req.params.question_id);
        if(question){
            if(question.userId === user.id){
                const file = await question.getAttachments({ where: {file_id: req.params.file_id}});
                if(file.length !== 0){
                    const new_file = file[0];
                    const result = await fileHelper.questionDelete(new_file, s3, question, res);
                    if(result){
                        res.status(204).send();
                        let end = Date.now();
                            var elapsed = end - start;
                            sdc.timing('timer.File_http_DELETE', elapsed);
                    } else {

                        res.status(500).send({
                            message: err
                         });
                         logger.error(err);
                    }   
                } else{

                    res.status(404).send({
                        message: "File doesnot exists!"
                    });
                    logger.error("File does not exists");
                }
            } else {
                res.status(403).send({
                    message: "Unauthorized to delete image to this question."
                });
                logger.error("Unauthorized to delete image to this question");
            }
        } else {

            res.status(404).send({
                message: "Question doesnot exists!"
            });
            logger.error("Question does not exists");
        }
    }
});

module.exports = {router, s3};