var app = app || {};


app.Posts = Backbone.Collection.extend({
  model: app.Post,
  
  page: 0,

  url: function(){
    return '/posts/'+this.page;
  },

  initialize: function(page){
    if(page){
      this.page = page;
    }
  }
});
