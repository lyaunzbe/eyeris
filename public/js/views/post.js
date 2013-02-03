 var app = app || {};

 app.PostView = Backbone.View.extend({

    //... is a list tag.
    tagName:  'li',

    // Cache the template function for a single item.
    template: _.template( $('#post-template').html() ),

    initialize: function() {
      console.log( $('#post-template').html() );
      this.model.on( 'change', this.render, this );
    },

    render: function() {
      this.$el.html( this.template( this.model.toJSON() ) );
      return this;
    }
 });
