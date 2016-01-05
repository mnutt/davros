import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('file', {path: '/files/*path'});
  this.route('home', {path: '/'});
  this.route('clients');
  this.route('publishing');
  this.route('about');
  this.route('not-found', {path: '*path'});
});

Router.reopen({
  updateSandstorm: function() {
    window.parent.postMessage({
      setPath: this.get('url')
    }, '*');
  }.on('didTransition')
});

export default Router;
