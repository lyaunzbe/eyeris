var request = require('request'),
    moment  = require('moment');

var cache = {
  reddit: {},
  hn :{}
};

cache.reddit.lastReq = moment(new Date());
cache.reddit.body = null;




var reddit = function(action, page, callback){
  var now = moment(new Date());
  if(action == 'init' || now.diff(cache.reddit.lastReq,'seconds') > 30){
    var count = page * 5;
    opts ={
      uri: 'http://www.reddit.com/r/programming/hot.json',
      json: true,
      qs:{
        limit: 100
      }
    };
    
  }else{
    console.log('Usig Cache');
    callback(null, cache.reddit.body);        
  }
  request.get(opts, function(e,r,body){
    cache.reddit.body = body;
    if(e) callback(e);
    callback(null, cache.reddit.body);    
  });
};

var hn = function(page, callback){
  var count = page * 5;
  
};

var dispatch = function(page, action){
  console.log(action);
  if(action == 'init'){
    reddit(action,page,function(err, body){
      if(err) console.log(err);
      console.log(body);
    });
  }

};

exports.dispatch = dispatch;
