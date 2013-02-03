  var app = app || {};

  
  // Our overall **AppView** is the top-level piece of UI.
  app.AppView = Backbone.View.extend({
    el: '#content',

    events: {

    },

    initialize: function(){
      console.log(app);
      app.page = 0; 
      this.posts = new app.Posts();
      this.posts.fetch();
    }
  });

