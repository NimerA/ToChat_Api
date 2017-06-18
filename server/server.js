'use strict';

var loopback = require('loopback');
var boot = require('loopback-boot');
var path = require('path');
var fs = require('fs');
var app = module.exports = loopback();

app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};



// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module) {
    // app.start()
    app.io = require('socket.io')(app.start())
    app.io.on('connection', (socket) => {
      console.log('a user connected')

      socket.on('join', (roomId, user) => {
        console.log('joining roomId', roomId)
        socket.join(roomId)
        app.io.to(roomId).emit('message', {
          roomId,
          user,
          userId: user.id,
          text: 'A user joined this room!',
          created: new Date()
        })
      })

      socket.on('sendMessage', (roomId, user, text) => {
        console.log('sendMessage roomId', roomId, 'userId', user.id, 'text', text)
        app.io.to(roomId).emit('message', {
          roomId,
          user,
          userId: user.id,
          text: text,
          created: new Date()
        })
      })

      socket.on('disconnect', () => {
        console.log('user disconnected')
      })
    })
  }
});

var dataSource = app.dataSources.mysql; 
dataSource.autoupdate(null, function (err){}); 





      

