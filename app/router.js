import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('file', {path: '/files'});
  this.resource('file', {path: '/files/*path'});
  this.route('home', {path: '/'});
  this.route('clients');
});

export default Router;
