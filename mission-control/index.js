var request = require('request'),
    moment  = require('moment'),
    cheerio = require('cheerio'),
    _       = require('underscore'),
    async   = require('async');


//var scrapeLobster = function(callback){
  //lobsters = [];
  //opts = {
    //uri:'https://lobste.rs/'
  //};
  //request.get(opts, function(e,r,body){
    //if(e) callback(e);
    //callback(body);
  //});
//};


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
      cache.reddit.body = body.data.children;
      cache.reddit.lastReq = moment(new Date());


      if(e) callback(e);
      if(action == 'init'){
        console.log('Reddit Initialized!');
        callback(null);    
      }else{
        var result = cache.reddit.body.slice(count, count+5);      
        callback(null, result);    
      }
    });

  }else{
    console.log('Reddit - Using Cache');
    var result = cache.reddit.body.slice(count, count+5);    
    callback(null, result);        
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
    async.series({
      news1: function(callback){
        request.get(opts, function(e,r, news1){
          if(e) callback(e);
          opts.uri = 'http://hndroidapi.appspot.com/news2';
          callback(null, news1);
        });
      },
      news2: function(callback){
        request.get(opts, function(e,r, news2){
          if(e) callback(e);
          callback(null, news2);
        });
      }},
      function(err, results) {
        if(err) callback(err);
        var news1 = results.news1;
        var news2 = results.news2;
        news1.items.pop();
        news2.items.pop();
        cache.hn.body.push(news1.items);
        cache.hn.body.push(news2.items);

        //flattens arrays nested 1 level deep [[x][y]]
        cache.hn.body = _.flatten(cache.hn.body);
        cache.hn.lastReq = moment(new Date());
        
        if(action == 'init') {
          console.log('HN Initialized!');
          callback(null);    
        }else{
          var result = cache.hn.body.slice(count, count+5);        
          callback(null, result);

        }
    });

  }else{
    var result = cache.hn.body.slice(count, count+5);
    console.log('HN - Using Cache');     
    callback(null, result);
  }
  
};

var dispatch = function(page, action, callback){
  console.log(action);
  if(action == 'init'){
    reddit(action,page,function(err){
      if(err) callback(err);
      hn(action, page, function(err){
        if(err) callback(err);
        callback(null); 
      });
    });
  }

  if(action == 'fetch'){
    reddit(action,page,function(err, reddit_res){
      if(err) callback(err);
      hn(action, page, function(err, hn_res){
        if(err) callback(err);
        var result  = reddit_res.concat(hn_res);
        console.log(result.length);
        callback(null, result); 
      });
    });
  }
};

exports.dispatch = dispatch;
