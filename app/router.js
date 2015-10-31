import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.resource('file', {path: '/files/*path'});
  this.route('home', {path: '/'});
  this.route('clients');
  this.route('not-found', {path: '*path'});
});

export default Router;
