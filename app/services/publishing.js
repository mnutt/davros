import { alias } from '@ember/object/computed';
import Service from '@ember/service';
import { computed, set, get } from '@ember/object';
import fetch from 'ember-network/fetch';

export default Service.extend({
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

  domain: alias('data.domain'),
  autoUrl: alias('data.autoUrl'),
  publicId: alias('data.publicId'),
  host: alias('data.host'),

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
