import Ember from 'ember';
import owncloudStatus from 'davros/lib/owncloud';

export default Ember.Controller.extend({
  unauthenticated: owncloudStatus
});
