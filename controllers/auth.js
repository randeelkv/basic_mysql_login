const mysql = require("mysql");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { promisify } = require('util');
const { reset } = require("nodemon");

const db = mysql.createConnection({
    host:process.env.DB_HOST,
    user: process.env.DB_USER,
    password:process.env.DB_PW,
    database:process.env.DATABASE
});

exports.login = async (req,res) =>{
    try {
        const {email,password} = req.body;
        if(!email || !password){
            return res.status(400).render('login',{
                message:"please provide an Email and Password"
            });
        }
        db.query('SELECT * FROM udns_users_credentials WHERE ucrd_email = ? ',[email],async(error, result)=>{
            if(!result || !(await bcrypt.compare(password,result[0].ucrd_password) )){
                return res.status(400).render('login',{
                    message:"Please Provide a correct Username/Password"
                });
            }else{
                const id = result[0].ucrd_id;
                const token = jwt.sign({id},process.env.JWT_SECRET_TOKEN,{
                    expiresIn:process.env.JWT_EXPIERATION
                });

                console.log("token is"+ token);

                const cookieOptions = {
                    expires : new Date(
                        Date.now()+ process.env.COKIE_EXPIERATION * 24 * 60 * 60 * 1000
                    ),
                    httpOnly:true
                }
                res.cookie('jwt',token,cookieOptions);
                res.status(200).redirect('/');
            }
        })

    } catch (error) {
        
    }
}
exports.register = (req,res) =>{
    console.log(req.body);
    
    // assign post values to local variables
    const {usr_name , user_email,user_pw,user_pw_conf} = req.body;
   
    db.query('SELECT ucrd_email FROM udns_users_credentials WHERE ucrd_email = ? ', [user_email], async (error,result) => {
        if(error){
            console.log(error);
        }
        if(result.length > 0){
            return res.render('register',{
                message:' That email is already taken'
            });
        }else if(user_pw !==user_pw_conf){
            return res.render('register',{
                message:'password to not match'
            });
        }
        let hashed_password = await bcrypt.hash(user_pw,8);
        
        db.query('INSERT INTO udns_users_credentials SET ?',{ucrd_name:usr_name,ucrd_email:user_email,ucrd_password:hashed_password},(error,results)=>{
            if(error){
                console.log(error);
            }else{
                console.log(results);
              return res.render('register',{
                  message:'User Registered'
              }); 
            }
        })
    });


}
exports.isLoggedIn = async (req,res,next) =>{
    console.log(req.cookies);
    if(req.cookies.jwt){
        try {
            const decoded = await promisify(jwt.verify)(req.cookies.jwt,process.env.JWT_SECRET_TOKEN);

            console.log(decoded);

            db.query('SELECT ucrd_id, ucrd_name, ucrd_email FROM udns_users_credentials WHERE ucrd_id = ?',[decoded.id],(error,result)=>{
                if(!result){
                    return next();
                }else{
                    req.user = result[0];
                    return next();
                }
            })
        } catch (error) {
            
        }
    }else{
        next();
    }
}

exports.logout = async (req,res)=>{
    res.cookie('jwt','logout',{
        expires:new Date(Date.now()+ 2*1000),
        httpOnly:true
    });

    res.status(200).redirect('/');
}