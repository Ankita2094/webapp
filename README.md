# webapp


Web-App Technology

    Nodejs

Dependencies:

    MySql
    BCrypt
    Mocha
    Chai

Building and Deploying Application Locally

    npm install (the command will install node_modules)
    node index.js/ set DEBUG = webapp:* & npm start (for express 4 and higher)


Instructions to run unit test

    npm test

All CodeDeploy and pr check done by github Actions


ADD SECRETS To GITHUB BEFORE ALL THE SETUPS TO EVERY REPOSITORY:
AWS_ACCESS_KEY, 
AWS_SECRET_ACCESS_KEY, 
AWS_S3_BUCKET, 
AWS_REGION

ARCHITECTURE DIAGRAM :
https://user-images.githubusercontent.com/69026663/108641591-00963280-746e-11eb-8f00-a82de20afb21.png

![alt text](https://github.com/Ankita2094/webapp/blob/master/img/ArchitectureDiagram.png?raw=true)

