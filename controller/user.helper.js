const db = require("../models");
const v4 = require('uuidv4');
const Question = db.questions;
const Category = db.categories;
const Answer = db.answers;
const File = db.file;
const SDC = require('statsd-client');
const logger = require('../logger');
const sdc = new SDC({host: 'localhost', port: 8125});



const getAllQuestions = async () => {

    let start1 = Date.now();
logger.info("Get All questions DB Call");
sdc.increment('QueryToDB');
    const questions = await Question.findAll({
        include: [
            {
                 as: 'categories',
                 model: Category,
                 through: {
                     attributes: []
                 }
            }, 
            {
                 as: 'answers',
                 model: Answer,
                 include: [
                    {
                        as: 'attachments',
                        model: File
                   }
                ]
            },
            {
                as: 'attachments',
                model: File
           }
        ]
    });

    let end1 = Date.now();
  var elapsed1 = end1 - start1;
  sdc.timing('QueryToDB', elapsed1);
    return questions;
}

const qById = async (id) => {

    let start1 = Date.now();
    logger.info("Get question by ID DB Call");
    sdc.increment('QueryToDB');

    const question = Question.findOne({
        where: {question_id: id }, 
        include: [
            {
                 as: 'categories',
                 model: Category,
                 through: {
                     attributes: []
                 }
            }, 
            {
                 as: 'answers',
                 model: Answer,
                 include: [
                    {
                        as: 'attachments',
                        model: File
                   }
                ]
            },
            {
                as: 'attachments',
                model: File
           }
        ]
    });
    let end1 = Date.now();
    var elapsed1 = end1 - start1;
    sdc.timing('QueryToDB', elapsed1);
    return question;

}

const getansById = async (id) => {

    let start1 = Date.now();
    logger.info("Get Answer by ID DB Call");
    sdc.increment('QueryToDB');

    const answer = await Answer.findOne({
        where: {answer_id: id }, 
    });

    let end1 = Date.now();
    var elapsed1 = end1 - start1;
    sdc.timing('QueryToDB', elapsed1);

    return answer;

}

const createNewQuestion = async (req, res, user, category) => {

    let start1 = Date.now();
    logger.info("Create New Question DB Call");
    sdc.increment('QueryToDB');

    let question = await Question.create({

        question_id: v4.uuid(),
        question_text: req.body.question_text

    });
    
    await user.addQuestion(question);
    
    await question.addCategory(category);
    const result = await qById(question.question_id);

    res.status(201).send(result.toJSON());

    let end1 = Date.now();
    var elapsed1 = end1 - start1;
    sdc.timing('QueryToDB', elapsed1);

}

const categoryPresent = async (req, res, cat) => {

    let start1 = Date.now();
    logger.info("Category DB Call");
    sdc.increment('QueryToDB');

    for(let i=0; i<cat.length; i++){
        
        let value = cat[i].category;

        if(!value || 0 === value.length){

            res.status(400).send({
                message: "Category Name cannot be empty!"
            });
            logger.error("Category name cannot be empty");

            return false;

        }
    }

    let end1 = Date.now();
    var elapsed1 = end1 - start1;
    sdc.timing('QueryToDB', elapsed1);

    return true;

}
const checkvalidCat = category => {
    var invalidChar = /[!@#$%^&*()_\=\[\]{};':"\\|,<>\/?]+/
    if(invalidChar.test(category)){
        return false;
    } else {
        return true;
    }
}

module.exports = {qById, getAllQuestions, getansById, createNewQuestion, categoryPresent ,checkvalidCat};