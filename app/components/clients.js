import Component from '@glimmer/component';
import owncloudStatus from '../lib/owncloud';
import { tracked } from '@glimmer/tracking';

export default class ClientsComponent extends Component {
  @tracked useAuthInServerUrl = false;
  unauthenticated = owncloudStatus;
}
