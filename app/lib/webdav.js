import Ember from 'ember';
import fetch from 'ember-network/fetch';

export default {
  propFindQuery: '<?xml version="1.0" ?>\n<D:propfind xmlns:D="DAV:"><D:allprop/></D:propfind>',

  propfind: function(path) {
    return fetch(path, {
      method: 'PROPFIND',
      body: this.propFindQuery
    }).then(function(response) {
      return response.text();
    }).then(function(raw) {
      return Ember.$.parseXML(raw);
    });
  },

  'delete': function(path) {
    return fetch(path, {
      method: 'DELETE'
    });
  },

  mkcol: function(path) {
    return fetch(path, {
      method: 'MKCOL'
    }).catch(function(err) {
      console.log(err);
    });
  }
};
