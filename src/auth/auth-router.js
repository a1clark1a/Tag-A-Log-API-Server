const express = require('express')
const AuthService = require('./auth-service')
const logger = require('../middleware/logger')

const authRouter = express.Router();
const jsonBodyParser = express.json();

authRouter.post('/login', jsonBodyParser, (req, res,next) => {
    const knexInstance = req.app.get('db');
    const { user_name, password } = req.body;
    const loginUser = { user_name, password };
    
    //VALIDATE login request
    for(const [key, value] of Object.entries(loginUser)){
        if(value==null){
            logger.error(`${key} missing`)
            return res.status(400).json({
                error: { message:`Missing '${key}' in request body`}
            })
        }
    }
    
    //GET USER
    AuthService.getUserWithUserName(knexInstance, loginUser.user_name)
    .then(dbUser => {
        if(!dbUser){
            logger.error('error retreiving dbUser')
            return res.status(400).json({
                error: { message: `Incorrect User name or password`}
            })
        }
        
        //VALIDATE password to check with hashed password
        return AuthService.comparePassword(
            loginUser.password,
            dbUser.password
        ).then(compareMatch => {
            if(!compareMatch){
                return res.status(400).json({
                    error: { message: `Incorrect User name or password`}
                })
            }
            
            //CREATE JWT
            const sub = dbUser.user_name,
            const payload = { user_id: dbUser.id };
            res.send({
                authToken: AuthService.createJwt(sub, payload),
                user_name: dbUser.user_name
            })
        })
    })
    .catch(next);
})


module.exports = authRouter;