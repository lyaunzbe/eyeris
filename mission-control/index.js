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
    
function sanitize(string){
  return string.replace('&euro;&trade;', '\'');
}

/**
 *
 * POST MODEL
 */

function Post(opts){
  this.title = opts.title;
  this.url = opts.url;
  this.permalink = opts.permalink;
  this.num_comments = opts.num_comments;
  this.score = opts.score;
  this.create_ts = opts.create_ts;
  this.author = opts.author;
}


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
      var children = body.data.children;
      var result = [];
      _.each(children, function(post){
        result.push(new Post({
          origin: 'reddit',
          title: post.data.title,
          url: post.data.url,
          permalink: post.data.permalink,
          num_comments: post.data.num_comments,
          score: post.data.score,
          create_ts: moment.unix(post.data.created_utc).from(moment.utc()),
          author: post.data.author
        }));
      });

      cache.reddit.body = result;
      cache.reddit.lastReq = moment(new Date());


      if(e) callback(e);
      if(action == 'init'){
        console.log('Reddit Initialized!');
        callback(null);    
      }else{
        var final  = cache.reddit.body.slice(count, count+5);
        callback(null, final);    
      }
    });

  }else{
    console.log('Reddit - Using Cache');
    var final = cache.reddit.body.slice(count, count+5);    
    callback(null, final);        
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
        cache.hn.body = [];
        var news1 = results.news1;
        var news2 = results.news2;
        news1.items.pop();
        news2.items.pop();
        cache.hn.body.push(news1.items);
        cache.hn.body.push(news2.items);
        
        //flattens arrays nested 1 level deep [[x][y]]

        var flat = _.flatten(cache.hn.body);
        var result = [];
        _.each(flat, function(post){
          result.push(new Post({
            origin: 'hn',
            title: sanitize(post.title),
            url: post.url,
            permalink: 'http://news.ycombinator.com/item?id='+post.item_id,
            num_comments: (function(){
              if(post.comments)
                return parseInt(post.comments.split(" ")[0]);
              else 
                return false;
            })(),
            score: (function(){
              console.log(post.score);
              if(post.score)
                return parseInt(post.score.split(" ")[0]);
              else
                return false;
            })(),
            create_ts: post.time,
            author: post.user || ''
          }));
        });

        cache.hn.body = result;
        cache.hn.lastReq = moment(new Date());
        if(action == 'init') {
          console.log('HN Initialized!');
          callback(null);    
        }else{
          var final = cache.hn.body.slice(count, count+5);        
          callback(null, final);
        }
      });
  }else{
    var final = cache.hn.body.slice(count, count+5);
    console.log(final);
    console.log('HN - Using Cache');     
    callback(null, final);
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
        result = _.shuffle(result);
        console.log(result);
        callback(null, result); 
      });
    });
  }
};

exports.dispatch = dispatch;
