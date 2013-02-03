var mc = require('../mission-control');


function getPage(page,req,res){
  if(!page){
    page = 0;
  }

  var that = this;
  mc.dispatch(page,'fetch', function(err, body){
    that.res.writeHead(200, {'content-type': 'text/json' });
    that.res.write( JSON.stringify(body) );
    that.res.end('\n');
  });
  
}

var routes = {
  '/posts':{
    get: getPage,
    '/(\[0-9]+)':{
      get: getPage
    }
  }
};

module.exports = routes;
