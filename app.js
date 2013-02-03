var union = require('union'),
    ecstatic = require('ecstatic'),
    director = require('director'),
    routes = require('./routes');


var mc = require('./mission-control');

mc.dispatch(0, 'init', function(err){
  if(err) console.log(err);
  console.log('Initialization complete');
});

var router = new director.http.Router(routes);    

var server = union.createServer({
  before: [
    ecstatic({ root: __dirname + '/public', autoIndex:true }),
    function (req, res) {
      var found = router.dispatch(req, res);
      if (!found) {
        res.emit('next');
      }
    }
  ]
});


server.listen(1337);


console.log('Shebanging the wingwangzizzle on :1337');
