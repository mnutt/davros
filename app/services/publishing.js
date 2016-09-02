import Ember from 'ember';
import fetch from 'ember-network/fetch';

const { get, set, computed } = Ember;

export default Ember.Service.extend({
  data: null,

  init: function() {
    fetch('/api/publish/info').then((response) => {
      return response.json();
    }).then((result) => {
      this.update(result);
    });
  },

  update(data) {
    set(this, 'data', data);
  },

  domain: computed.alias('data.domain'),
  autoUrl: computed.alias('data.autoUrl'),
  publicId: computed.alias('data.publicId'),
  host: computed.alias('data.host'),

  urlBase: computed('domain', 'autoUrl', function() {
    let domain = get(this, 'domain');
    let autoUrl = get(this, 'autoUrl');

    if(domain) {
      return `https://${domain}`;
    } else if(autoUrl) {
      return autoUrl;
    } else {
      return null;
    }
  })
});
