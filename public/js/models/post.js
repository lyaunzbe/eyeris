// js/models/post.js

  var app = app || {};

  // Post Model
  // ----------

  app.Post = Backbone.Model.extend({

    // Default attributes for the todo
    // and ensure that each todo created has `title` and `completed` keys.
    defaults: {
      title: ''
    }
  });
