import EmberRouter from '@embroider/router';
import config from './config/environment';

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
