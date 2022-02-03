const express = require('express');
const router = express.Router();
const gravatar=require('gravatar');
const bcrypt=require('bcryptjs');
const {check, validationResult} =require('express-validator');

const User = require('../../models/User');

//@route  GET api/users
//@desc   Test route -> register users
//@access Public
router.post('/', 
[
    check('name', 'Name is required')
        .not()
        .isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password','please enter a password with 8 or more characters').isLength({min:8})
], 
async (req, res) => {
    //console.log(req.body);
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }

    const {name, email, password} = req.body;

    try{
    //see if user exists
    let user=await User.findOne({email});

    if(user){
      return res.status(400).json({errors:[{msg:"User already exsists!"}]});
    }

    //get users gravatar base on email
    const avatar=gravatar.url(email,{
        s: '200', //size?
        r: 'pg',  //parental guidance
        d: 'mm'  //default pic if the user doesnt has a gravatar
    });

    user=new User({
        name,
        email,
        avatar,
        password
    }
    );

    //encrypt pw using bcrypt
        const salt=await bcrypt.genSalt(10);
        user.password=await bcrypt.hash(password,salt);
        await user.save();

    //return jsonwebtoken
      
       res.send('User registered');
        }catch(err){
        console.log(err.message);
        res.status(500).send('server error');

        }

    }
);

module.exports = router;