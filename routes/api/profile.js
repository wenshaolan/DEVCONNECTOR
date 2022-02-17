const express = require('express');
const router = express.Router();
const auth=require('../../middleware/auth');
//const {check, validationResult}=require('express-validator/check');
const {check, validationResult} =require('express-validator');

const Profile=require('../../models/Profile');
const User=require('../../models/User');

//@route  GET api/profile/me
//@desc   Get current user's profile base on the token
//@access Private
router.get('/me', auth, async (req, res) => {
    //console.log(111);
    try {
        const profile=await Profile.findOne({user: req.user.id}).populate('user',['name', 'avatar']);
    //console.log(req.user.id);

        if(!profile){
            return res.status(400).json({msg: 'There is no profile for this user'});
        }
        res.json(profile);

    } catch (error) {
        console.error(error.message);
        res.status(500).send('server error');
        
    }
});

//@route  POST api/profile
//@desc   Create or update user profile
//@access Private
router.post(
    '/', 
    [
        auth, 
        [
            check('status','Status is required').not().isEmpty(),
            check('skills', 'skill is required').not().isEmpty()
        ]
    ],
    async (req,res)=> {
        console.log(req.header('x-auth-token'));
        console.log( req.user.id);
               const errors=validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors:errors.array()});
        }
        const{
            company,
            website,
            location,
            bio,
            status,
            githubusername,
            skills,
            youtube,
            facebook,
            twitter,
            instagram,
            linkedin
        }=req.body;

        //build profile object
        const profileFields={};
        profileFields.user=req.user.id;
        if(company) profileFields.company=company;
        if(website) profileFields.website=website;
        if(location) profileFields.location=location;
        if(bio) profileFields.bio=bio;
        if(status) profileFields.status=status;
        if(githubusername) profileFields.githubusername=githubusername;
        if(skills){
            profileFields.skills=skills.split(',').map(skill=>skill.trim());
        }
        //build social object
        profileFields.social={};
        if(youtube) profileFields.social.youtube=youtube;
        if(twitter) profileFields.social.twitter=twitter;
        if(facebook) profileFields.social.facebook=facebook;
        if(linkedin) profileFields.social.linkedin=linkedin;
        if(instagram) profileFields.social.instagram=instagram;

        //console.log(profileFields.skills);
//        res.send('HELLO')
        try {
            
            let profile=await Profile.findOne({user: req.user.id});
            //console.log(profile);
            if(profile){
                console.log('111');
                //update
                profile=await Profile.findOneAndUpdate(
                    {user: req.user.id}, 
                    {$set: profileFields},
                    {new: true}
                );
                //console.log(profile);
                return res.json(profile);
            }
            console.log('222');
            profile=new Profile(profileFields);
            await profile.save();
            res.json(profile);
        } catch (error) {
            console.error(error.message);
            res.status(500).send('server error');
            
        }
    }
); 

//@route  GET api/profile
//@desc   GET ALL profiles
//@access Public
router.get('/', async (req,res)=>{
    try {
        const profiles=await Profile.find().populate('user',['name','avatar']);
        res.json(profiles);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('server error');

        
    }
});

//@route  GET api/profile/user/:user_id
//@desc   GET profile by user ID
//@access Public
router.get('/user/:user_id', async (req,res)=>{
    try {
        const profile=await Profile.findOne({user: req.params.user_id}).populate('user',['name','avatar']);
        if(!profile) return res.status(400).json({msg:'there is no profile for this user'});
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        if(err.kind=="ObjectId"){
            return res.status(400).json({msg:'there is no profile for this user'});
        }
        res.status(500).send('server error');

        
    }
});

//@route  DELETE api/profile
//@desc   DELETE profile, users and posts
//@access private
router.delete('/', auth, async (req,res)=>{
    try {
        //todo: remove users posts


        //remove profile
        await Profile.findOneAndRemove({user: req.user.id});
        //remove user
        await User.findOneAndRemove({_id: req.user.id});
        res.json({msg: 'user deleted'});
    } catch (err) {
        console.error(err.message);
        if(err.kind=="ObjectId"){
            return res.status(400).json({msg:'there is no profile for this user'});
        }
        res.status(500).send('server error');
    }
});

//@route  PUT api/profile/experience
//@desc   add profile experience
//@access private
router.put('/experience', [
    auth,
    [
        check('title','title is required').not().isEmpty(),
        check('company','company is required').not().isEmpty(),
        check('from','from date is required').not().isEmpty(),
    ]    
    ], 
    async (req,res)=>{
        const errors=validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()});
        };

        const{
            title,
            company,
            location,
            from,
            to,
            current,
            description
        }=req.body;

        const newExp={
            title,
            company,
            location,
            from,
            to,
            current,
            description
        };

        try {
            const profile=await Profile.findOne({user:req.user.id});

            profile.experience.unshift(newExp);
            await profile.save();

            res.json(profile);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('server error');
            
        }

});

//@route  DELETE api/profile/experience/:exp_id
//@desc   DELETE profile experience from profile
//@access private
router.delete('/experience/:exp_id',auth, async(req,res)=>{
    try {
        const profile=await Profile.findOne({user:req.user.id});

        //get remove index
        const removeIndex=profile.experience
        .map(item=>item.id)
        .indexOf(req.params.exp_id);

        profile.experience.splice(removeIndex,1);
        await profile.save();
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('server error');
        
    }
});

//@route  PUT api/profile/education
//@desc   add profile edutation
//@access private
router.put('/education', [
    auth,
    [
        check('school','school is required').not().isEmpty(),
        check('degree','degree is required').not().isEmpty(),
        check('fieldofstudy','field of study is required').not().isEmpty(),
        check('from','from date is required').not().isEmpty(),
    ]    
    ], 
    async (req,res)=>{
        const errors=validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()});
        };

        const{
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description
        }=req.body;

        const newEdu={
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description
        };

        try {
            const profile=await Profile.findOne({user:req.user.id});

            profile.education.unshift(newEdu);
            await profile.save();

            res.json(profile);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('server error');
            
        }

});

//@route  DELETE api/profile/education/:edu_id
//@desc   DELETE profile education from profile
//@access private
router.delete('/education/:edu_id',auth, async(req,res)=>{
    try {
        const profile=await Profile.findOne({user:req.user.id});

        //get remove index
        const removeIndex=profile.education
        .map(item=>item.id)
        .indexOf(req.params.edu_id);

        profile.education.splice(removeIndex,1);
        await profile.save();
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('server error');
        
    }
})


module.exports = router;