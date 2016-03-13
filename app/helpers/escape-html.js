import Ember from 'ember';

export function escapeHtml(params) {
  return Ember.Handlebars.Utils.escapeExpression(params);
}

export default Ember.Helper.helper(escapeHtml);
