import Ember from 'ember';
import fetch from 'ember-network/fetch';

const { get, inject } = Ember;

export default Ember.Route.extend({
  publishing: inject.service(),

  actions: {
    publish: function() {
      let publishUrl = "/api/publish";
      let domain = get(this, 'controller.domain');
      if(domain && domain !== '') {
        publishUrl += `?domain=${encodeURIComponent(domain)}`;
      }

      fetch(publishUrl, {method: 'POST'}).then((response) => {
        return response.json();
      }).then((result) => {
        get(this, 'publishing').update(result);
      });
    },

    unpublish: function() {
      fetch('/api/unpublish', {method: 'POST'}).then(() => {
        get(this, 'publishing').update({});
      });
    }
  }
});
