import Controller from '@ember/controller';
import owncloudStatus from 'davros/lib/owncloud';

export default Controller.extend({
  unauthenticated: owncloudStatus
});
