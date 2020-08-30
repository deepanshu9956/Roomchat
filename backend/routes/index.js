require('dotenv').config()

const express = require('express');
const router = express.Router();
const cors = require('cors');
const user = require('../bin/userSession');

router.use(cors());
router.use(express.json())
// router.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/chat/register',async function(req, res, next) {
  console.log('EXPRESS register ', req.body);
  const name = req.body.username;
  if (!name) {
    res.status(400).send({
      "status": "Error",
      "message": "User name not found",
    })
    return;
  }
  const email = req.body.email;
  if (!email) {
    res.status(400).send({
      "status": "Error",
      "message": "Email not found",
    })
    return;
  }
  const password = req.body.password;
  if (!password) {
    res.status(400).send({
      "status": "Error",
      "message": "Password not found",
    })
    return;
  }
  const {response, error} = await user.register(name, email, password, res);
  console.log('Register Resp ', response, error)
  if (error) {
    res.status(400).send({
      "status": "Error",
      "message": error,
    })
  } else {
    res.json({
      "status": "Success",
      "message": response
    })
  }
});

router.post('/chat/login', async function(req, res, next) {
  console.log('EXPRESS login ', req.body);
  const email = req.body.email;
  if (!email) {
    res.status(400).send({
      "status": "Error",
      "message": "Email not found",
    })
    return;
  }
  const password = req.body.password;
  if (!password) {
    res.status(400).send({
      "status": "Error",
      "message": "Password not found",
    })
    return;
  }
  const ttl = req.body.ttl ? req.body.ttl : 120;
  const {response, error} = await user.login(email, password, ttl);
  console.log('Login Resp ', response, error)
  if (error) {
    res.status(400).send({
      "status": "Error",
      "message": error,
    })
  } else {
    res.json({
      "status": "Success",
      "message": response
    })
  }
});

router.post('/chat/logout', async function(req, res, next) {
  console.log('EXPRESS logout ', req.body);
  const token = req.body.token;
  const {response, error} = await user.logout(token);
  console.log('Logout Resp ', response, error)
  if (error) {
    res.status(400).send({
      "status": "Error",
      "message": error,
    })
  } else {
    res.json({
      "status": "Success",
      "message": response
    })
  }
});

router.post('/chat/validate', async function(req, res, next) {
  console.log('EXPRESS validate ', req.body);
  const loginToken = req.body.token;
  if (!loginToken) {
    res.status(400).send({
      "status": "Error",
      "message": "Token not found"
    })
    return;
  }
  const {response, error} = await user.validate(loginToken)
  console.log('Validate Resp ', response, error)
  if (error) {
    res.status(400).send({
      "status": "Error",
      "message": error,
    })
  } else {
    res.json({
      "status": "Success",
      "message": response
    })
  }
})

router.post('/chat/refresh', async function(req, res, next) {
  console.log('EXPRESS refresh ', req.body);
  const loginToken = req.body.token;
  const ttl = req.body.ttl ? req.body.ttl : 120;
  const {response, error} = await user.refresh(loginToken, ttl);
  console.log('Refresh Resp ', response, error)
  if (error) {
    res.status(400).send({
      "status": "Error",
      "message": error,
    })
  } else {
    res.json({
      "status": "Success",
      "message": response
    })
  }
})

module.exports = router;
