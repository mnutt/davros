import EmberRouter from '@ember/routing/router';
import config from 'davros/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('file', { path: '/files/*path' });
  this.route('files');
  this.route('home', { path: '/' });
  this.route('clients');
  this.route('publishing');
  this.route('about');
});
