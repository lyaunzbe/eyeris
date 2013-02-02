var mc = require('../mission-control');


function getPage(page){
  if(!page){
    page = 0;
  }
  mc.dispatch(page,'fetch');
  
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
