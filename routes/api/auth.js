const express = require('express');
const router = express.Router();
const auth=require('../../middleware/auth');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const config=require('config');
const {check, validationResult} =require('express-validator');

const User=require('../../models/User');

//@route  GET api/auths
//@desc   Test route
//@access Public
router.get('/', auth, async(req, res) => {
    //console.log('222');
    try{
        const user=await User.findById(req.user.id).select('-password');
        res.json(user);
    }catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }

   // res.send('Auths Route'));
});


//@route  GET api/auth
//@desc   authenticate user & get token
//@access Public
router.post('/', 
[
    check('email', 'Please include a valid email').isEmail(),
    check('password','password is required').exists()
], 
async (req, res) => {
    //console.log(req.body);
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }

    const {email, password} = req.body;
    //console.log(email);
    try{
    //see if user exists
    let user=await User.findOne({email});
    //console.log(user);
    if(!user){
      return res
      .status(400)
      .json({errors:[{msg:"invalid credentials2"}]});
    }

    const isMatch=await bcrypt.compare(password, user.password);
    
    if(!isMatch){
        return res
        .status(400)
        .json({errors:[{msg:"invalid credentials1"}]});
    }
    
    //return jsonwebtoken
      
       //res.send('User registered');
        const payload={
            user:{
                id: user.id
            }
        }

        jwt.sign(
            payload, 
            config.get('jwtSecret'),
            {expiresIn: 360000},
            (err, token)=>{
                if(err) throw err;
                res.json({token});
            }
            )

        }catch(err){
        console.log(err.message);
        res.status(500).send('server error');

        }

    }
);


module.exports = router;