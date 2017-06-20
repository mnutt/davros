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
      if(response.status >= 200 && response.status < 400) {
        return response.text();
      } else {
        if(response.status === 404) {
          throw(new Error(`404 Not Found`));
        } else {
          throw(new Error(`${response.status} Error`));
        }
      }
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
      console.error(err);
    });
  }
};
