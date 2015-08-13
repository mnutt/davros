import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.resource('file', {path: '/files/*path'});
  this.route('files', {path: '/'});
  this.route('files', {path: '/files'});
  this.route('clients');
});

export default Router;
