import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('file', {path: '/files/*path'});
  this.route('files');
  this.route('home', {path: '/'});
  this.route('clients');
  this.route('publishing');
  this.route('about');
  this.route('application-error', {path: '*path'});
});

Router.reopen({
  updateSandstorm: function() {
    window.parent.postMessage({
      setPath: this.get('url')
    }, '*');
  }.on('didTransition')
});

export default Router;
