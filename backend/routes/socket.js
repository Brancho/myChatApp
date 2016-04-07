// Keep track of which handles are used so that there are no duplicates

var _ = require('underscore');
var redis = require("redis").createClient();
var md5 = require("js-md5")


var users = (function () {

  var collection = [];

  function get(){
    return collection;

  }

  function set(user){
    if(!_.find(collection, function(x){ return x.handle === user.handle })){
      collection.push(user);
      return true;
    }else{
      return false;
    }
  }

  function remove(user){
    console.log(collection);
    console.log('Removing user...');
    collection = _.reject(collection, function(x){ return x.handle === user.handle; });
    console.log(collection);
  }


  return {
    set: set,
    get: get,
    remove: remove,
  };
}());


module.exports = function(socket, router){
  // broadcast a user's message to other users

  var currentUser;
  var messages = [];

  socket.on('user:init', function (data) {
    if(users.set(data)){
      console.log('Added User');
      currentUser = data;
      currentUser.id = md5(JSON.stringify(data));
      messages.push({ channel: '#general', text: 'Welcome to chat', user: {}});
      socket.emit('init:chat', {
        success: true,
        message: "Welcome to chat",
        data: {
          current_user: currentUser,
          users: users.get()
        }
      });
      socket.broadcast.emit('frontend:user:change', {
        users: users.get()
      });
    }else{
      socket.emit('init:chat', {
        success: false,
        message: "User exists",
        data: {}
      });
    }
  });

  socket.on('send:message', function (data) {
    var key = "messages_channel_" + data.channel;
    data.sent_at = Date.now();
    console.log(data);
    //redis.set(key, "string val", redis.print);
    redis.get(key, function(err, reply) {
      var parsedData;
        try {
          parsedData = JSON.parse(reply);
          parsedData.push(data);
        }
        catch(err) {
          parsedData = [];
          parsedData.push(data);
        }

      redis.set(key, JSON.stringify(parsedData));

    });
    socket.broadcast.emit('new:message', data);
  });

  socket.on('send:private:message', function (data) {
    var key = _.sortBy([currentUser.id, data.to], function(num){ return num }).join('');
    console.log(key);
    data.sent_at = Date.now();
    redis.get(key, function(err, reply) {
      var parsedData;
        try {
          parsedData = JSON.parse(reply);
          parsedData.push(data);
        }
        catch(err) {
          parsedData = [];
          parsedData.push(data);
        }
      redis.set(key, JSON.stringify(parsedData));

    });
    socket.broadcast.emit('new:private:message', data);
  });


  // clean up when a user leaves, and broadcast it to other users
  socket.on('get:private:messages', function (data) {
    var key = data.key;
    console.log(key);
    redis.get(key, function(err, reply) {
      socket.emit('init:private:messages', JSON.parse(reply));
      console.log(JSON.parse(reply));
    });
  });



  // clean up when a user leaves, and broadcast it to other users
  socket.on('disconnect', function () {
    if(!!currentUser){
      users.remove(currentUser);
      socket.broadcast.emit('frontend:user:change', {
        user_left: currentUser,
        users: users.get()
      });
    }
  });


};
