  var app = app || {};

  
  // Our overall **AppView** is the top-level piece of UI.
  app.AppView = Backbone.View.extend({

    events: {

    },

    initialize: function(){
      console.log(app);
      var that = this;
      app.page = 0; 
      this.posts = new app.Posts();

      this.postsView = new app.PostsView({collection: this.posts});

      this.posts.fetch({ success:function(){
        $('#main').html(that.postsView.render().el);
      }});

      

    }
  });

