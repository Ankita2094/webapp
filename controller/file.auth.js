const v4 = require('uuidv4');
const fs = require('fs');
const db = require('../models');
const File = db.file;
const _ = require('underscore');

const SDC = require('statsd-client');
const logger = require('../logger');
const sdc = new SDC({host: 'localhost', port: 8125});

const answerUpload = async (source, targetName, s3, Answer, file_id, req, res) => {


    fs.readFile(source, async (err, filedata) => {

        if (!err) {

            var params = {

                Key: targetName,
                Body: filedata,
                Bucket: process.env.AWS_BUCKET_NAME,
                
            };

            let start1 = Date.now();
            logger.info("S3 access-answer file upload");
            sdc.increment('S3 access-answer file upload');

            await s3.upload(params, async(err, data) => {

                if(err){

                    res.status(500).send({
                        message: err
                    });
                    logger.error("Internal error--"+err);

                } else {

                    const aws_metadata = JSON.parse(JSON.stringify(data));

                    const file = await File.create({
                        file_id: file_id,
                        content_type: req.file.mimetype,
                        size: req.file.size,
                        aws_metadata_etag:aws_metadata.ETag,
                        url: aws_metadata.Location,
                        file_name: req.file.originalname,
                        s3_object_name: targetName,
                        aws_metadata_bucket: aws_metadata.Bucket
                    });
    
                    await Answer.addAttachment(file);

                    let result = await File.findOne({where: {file_id: file_id}}) 
                    // res.status(201).send(result);
                    res.status(201).send(_.pick(result, ['file_id', 'file_name', 's3_object_name', 'created_date', 'content_type', 'size']));

                }
            });

            let end1 = Date.now();
    var elapsed1 = end1 - start1;
    sdc.timing('timer.S3 access-answer file upload', elapsed1);

        } else {

            res.status(500).send({
                message: err
            });
            logger.error("Internal error---"+err );
        }
    });

}

const answerDelete = async (file, s3, answer) => {

    let result = true;

    const params = {

        Bucket: process.env.AWS_BUCKET_NAME,
        Key: file.s3_object_name,

    }

    let start1 = Date.now();
            logger.info("S3 access-answer file delete");
            sdc.increment('S3 access-answer file delete');

    await s3.deleteObject(params, async(err, data) => {

        if(err){
            
            
            result = false;

        } else {

            await answer.removeAttachment(file);

            await File.destroy({where: {file_id: file.file_id}});

            result = true;

        }
        
    });

    let end1 = Date.now();
    var elapsed1 = end1 - start1;
    sdc.timing('timer.S3 access-answer file delete', elapsed1);

    return result;

}

const questionUpload = async (source, targetName, s3, Question, file_id, req, res) => {

    fs.readFile(source, async (err, filedata) => {

        if (!err) {

            var params = {

                Key: targetName,
                Body: filedata,
                Bucket: process.env.AWS_BUCKET_NAME,
               
            };

            let start1 = Date.now();
            logger.info("S3 access");
            sdc.increment('S3 access');

            await s3.upload(params, async(err, data) => {

                if(err){

                    res.status(500).send({
                        message: err
                    });
                    logger.error("S3 upload access error--" +err);

                } else {
                    
                    const aws_metadata = JSON.parse(JSON.stringify(data));

                    const file = await File.create({
                        file_id: file_id,
                        file_name: req.file.originalname,
                        aws_metadata_etag:aws_metadata.ETag,
                        s3_object_name: targetName,
                        content_type: req.file.mimetype,
                        size: req.file.size,
                        url: aws_metadata.Location,
                        aws_metadata_bucket: aws_metadata.Bucket
                    });
    
                    await Question.addAttachment(file);
                    
                    let result = await File.findOne({where: {file_id: file_id}}) 
                    // res.status(201).send(result);
                    res.status(201).send(_.pick(result, ['file_id', 'file_name', 's3_object_name', 'created_date', 'content_type', 'size']));

                }
            });

            let end1 = Date.now();
    var elapsed1 = end1 - start1;
    sdc.timing('timer.S3 access', elapsed1);

        } else {

            res.status(500).send({
                message: err
            });
            logger.error("S3 access error--"+err);
        }
    });

}

const questionDelete = async (file, s3, question) => {

    let start1 = Date.now();
            logger.info("S3 access-delete file");
            sdc.increment('S3 access-delete file');

    let result = true;
    const params = {

        Bucket: process.env.AWS_BUCKET_NAME,
        Key: file.s3_object_name,

    }

    await s3.deleteObject(params, async(err, data) => {

        if(err){

            logger.error("S3 error--" +err);
            result = false;

        } else {

            await question.removeAttachment(file);

            await File.destroy({where: {file_id: file.file_id}});

            result = true;
        }
        
    });

    let end1 = Date.now();
    var elapsed1 = end1 - start1;
    sdc.timing('timer.S3 access-deleteFile', elapsed1);

    return result;

}

module.exports = {questionDelete, answerDelete, questionUpload, answerUpload};