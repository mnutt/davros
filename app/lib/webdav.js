import ajax from 'ic-ajax';

export default {
  propFindQuery: '<?xml version="1.0" ?>\n<D:propfind xmlns:D="DAV:"><D:allprop/></D:propfind>',

  propfind: function(path) {
    return ajax({
      method: 'propfind',
      url: path,
      dataType: 'xml',
      body: this.propFindQuery
    });
  },

  'delete': function(path) {
    return ajax({
      method: 'delete',
      url: path
    });
  },

  mkcol: function(path) {
    return ajax({
      method: 'mkcol',
      url: path
    }).catch(function(err) {
      console.log(err);
    });
  }
};
