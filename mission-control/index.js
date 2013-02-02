var request = require('request'),
    moment  = require('moment'),
    cheerio = require('cheerio');


var scrapeLobster = function(callback){
  lobsters = [];
  opts = {
    uri:'https://lobste.rs/'
  };
  request.get(opts, function(e,r,body){
    if(e) callback(e);
    callback(body);
  });
};


var cache = {
  reddit: {},
  hn :{}
};

cache.reddit.lastReq = moment(new Date());
cache.reddit.body = null;


cache.hn.lastReq = moment(new Date());
cache.hn.body = [];

var reddit = function(action, page, callback){
  var count = page * 5;
  
  var now = moment(new Date());
  if(action == 'init' || now.diff(cache.reddit.lastReq,'seconds') > 30){
    console.log('Reddit - Using Request');
    opts ={
      uri: 'http://www.reddit.com/r/programming/hot.json',
      json: true,
      qs:{
        limit: 60
      }
    };
    request.get(opts, function(e,r,body){
      cache.reddit.body = body;
      cache.reddit.lastReq = moment(new Date());
      if(e) callback(e);
        callback(null, cache.reddit.body);    
    });

  }else{
    console.log('Reddit - Using Cache');
    callback(null, cache.reddit.body);        
  }
};

var hn = function(action, page, callback){
  var count = page * 5;

  var now = moment(new Date());  
  if(action == 'init' || now.diff(cache.hn.lastReq,'seconds') > 30){
    console.log('HN - Using Request'); 
    opts = {
      uri:'http://hndroidapi.appspot.com/news',
      json: true
    };
    request.get(opts, function(e,r, news1){
      if(e) callback(e);
      opts.uri = 'http://hndroidapi.appspot.com/news2';
      request.get(opts, function(e,r, news2){
        if(e) callback(e);
        cache.hn.body.push(news1.items);
        cache.hn.body.push(news2.items);

        //flattens arrays nested 1 level deep [[x][y]]
        cache.hn.body = Array.prototype.concat.apply([], cache.hn.body);
        
        cache.hn.body.pop();

        callback(null, cache.hn.body);
      });
    });

  }else{
    console.log('HN - Using Cache');     
    callback(null, cache.hn.body);
  }
  
};

var dispatch = function(page, action){
  console.log('Dispatcher:'+ action);
  reddit(action,page,function(err, body){
    if(err) console.log(err);
    //console.log(body);
    hn(action, page, function(err, body){
      if(err) console.log(err);
      //console.log(body);
    });
  });
  
};

exports.dispatch = dispatch;
