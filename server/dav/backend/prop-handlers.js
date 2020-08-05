"use strict";

var jsDAV_iNode = require('jsDAV/lib/DAV/interfaces/iNode');

var Async = require('asyncjs');

/**
 * iProperties interface
 *
 * Implement this interface to support custom WebDAV properties requested and sent from clients.
 */
var PropHandlers = module.exports = jsDAV_iNode.extend({
    propHandlers: {},

    /**
     * Returns a list of properties for this nodes.
     *
     * The properties list is a list of propertynames the client requested,
     * encoded in clark-notation {xmlnamespace}tagname
     *
     * If the array is empty, it means 'all properties' were requested.
     *
     * @param {Object} properties
     * @return void
     */
    getHandlerProperties: function(properties, callback) {
        var self = this;
        var returnedProperties = {};
        // property must be requested to be processed...
        var propsToCheck = properties.filter(function(prop) {
            return !!self.propHandlers[prop];
        });
  
        Async.list(propsToCheck)
            .delay(0, 10)
            .each(function(prop, next) {
                self.propHandlers[prop].call(self, prop, function(err, value) {
                    returnedProperties[prop] = value;
                    next(err);
                });
            })
            .end(function(err) {
                callback(err, returnedProperties);    
            });
    }
});
