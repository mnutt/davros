import Ember from 'ember';
import fetch from 'ember-network/fetch';

const propFindQuery = new Blob(['<?xml version="1.0" ?>\n<D:propfind xmlns:D="DAV:"><D:allprop/></D:propfind>'], {type: 'application/xml'});

export default {
  base: '/remote.php/webdav',

  propfind: function(path) {
    return fetch(path, {
      method: 'PROPFIND',
      contentType: 'application/xml',
      body: propFindQuery
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
