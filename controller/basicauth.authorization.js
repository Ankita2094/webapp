const auth = require('basic-auth');
const bcrypt = require('bcrypt');
const SDC = require('statsd-client');
const logger = require('../logger');
const sdc = new SDC({host: 'localhost', port: 8125});


const checkAuthorization = async (req,res, Users) => {

    const userauth = auth(req);

    // console.log("userauth" +userauth);

    if(!userauth){

        res.status(400).send({
            message: "Provide proper email and password"
        });
        logger.error(message);

    } else {

        let username = userauth.name;
        let password = userauth.pass;

        if(username && password){
            let start1 = Date.now();
            logger.info("User Authorization DB Call");
            sdc.increment('QueryToDB');

            let user = await Users.findOne({
                where: {
                    emailAddress: username
                }
            });

            let end1 = Date.now();
    var elapsed1 = end1 - start1;
    sdc.timing('User-Auth-QueryToDB', elapsed1);

            if(!user){

                res.setHeader('WWW-Authentication', 'Basic realm = "example"');
                res.status(401).send({
                    Unauthorized: "Username doesn't exists"
                });
                logger.error(Unauthorized);

            } else {

                if(! await bcrypt.compare(password, user.password)){
                    res.setHeader('WWW-Authentication', 'Basic realm = "example"');
                    res.status(401).send({
                        Unauthorized: "Invalid Credentials"
                    });
                    logger.error(Unauthorized);

                } else {

                    return user;

                }
            }
        } else {

            if(typeof username === typeof "" && typeof password === typeof "") {
                res.status(400).send({
                    message: "Please enter Username and Password!"
                });
                logger.error(message);
            }

        }

    }
    
}



module.exports = {checkAuthorization}