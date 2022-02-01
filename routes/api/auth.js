const express = require('express');
const router = express.Router();

//@route  GET api/auths
//@desc   Test route
//@access Public
router.get('/', (req, res) => res.send('Auths Route'));

module.exports = router;