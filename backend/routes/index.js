var express = require('express');
var router = express.Router();
var redis = require("redis").createClient();


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Welcome to chat' });
});

router.get('/messages/:channel', function(req, res, next) {
  console.log(req.params.channel);
  var key = "messages_channel_" + req.params.channel;
  //redis.set(key, "string val", redis.print);
  redis.get(key, function(err, reply) {
    // reply is null when the key is missing
    res.json(JSON.parse(reply));
  });
});

//
//router.get('/messages/:channel', function(req, res, next) {
//  console.log(req.params.channel);
//  var key = "messages_channel_" + req.params.channel;
//  //redis.set(key, "string val", redis.print);
//  redis.get(key, function(err, reply) {
//    // reply is null when the key is missing
//    res.json(JSON.parse(reply));
//  });
//});


module.exports = router;
