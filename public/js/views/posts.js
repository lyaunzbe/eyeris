 var app = app || {};

  
  // Our overall **AppView** is the top-level piece of UI.
  app.PostsView = Backbone.View.extend({
    el:"#content",

    events: {

    },

    render: function(){
      console.log('yo');
      this.collection.each(function(post){
        console.log(app);
        var postView = new app.PostView({model:post});
        $(this.el).prepend(postView.render().el);
      }, this);

      return this;

    }
  });

