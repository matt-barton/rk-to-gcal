module.exports = {
  _id: "_design/users",
  language: "javascript",

  views: {

    byIdentity: {

      map: function(doc) {
        if (doc.type && doc.type == 'user' && !doc.disabled) {
          emit(doc.identity.toLowerCase(), doc);
        }
      }
    }
    
  }
};