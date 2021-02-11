const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const users = require("./controller/users.controller.js");
const logger = require('./logger');


const app = express();
require('dotenv').config();

const db = require("./models");
//db.sequelize.sync();
db.sequelize.sync({ force: false }).then(() => {
  console.log(`Database Connected.`);
});


var corsOptions = {
  origin: "http://localhost:8081"
};

app.use(cors(corsOptions));

// parse requests of content-type(application/json)
app.use(bodyParser.json());

// parse requests of content-type
app.use(bodyParser.urlencoded({ extended: true }));

// check route

//app.get("​/v1/question/:question_id/answer/:answer_id", users.getAnswer);
// require("./controller/file.controller")(app);
// // require("./controller/file.controller");

// require("./routes/users.route")(app);
//  require("./routes/answer.route")(app);
//  require("./routes/question.route")(app);
 
//Import Routes
const userRoute = require('./routes/users.route');
app.use('/v1/user', userRoute);

const questionRoute = require('./routes/question.route');
app.use('/v1/question', questionRoute);

app.get('/v1/questions', require("./controller/users.controller.js").getAllQuestions);

const answerRoute = require('./routes/answer.route');
app.use('/v1/question', answerRoute);

const fileRoute = require('./controller/file.controller');
app.use('/v1/question', fileRoute.router);





// set port, listen for requests(8080)
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}.`);
});

module.exports = app;
