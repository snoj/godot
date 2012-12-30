/*
 * producer-test.js: Basic tests for the producer module.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var assert = require('assert'),
    vows = require('vows'),
    godot = require('../../lib/godot'),
    macros = require('../macros').producer,
    Producer = godot.producer.Producer;

vows.describe('godot/producer').addBatch({
  "Godot producer": {
    "should have the correct methods for setting events": function () {
      [
        'host',
        'service',
        'state',
        'description',
        'tags',
        'metric',
        'ttl'
      ].forEach(
        function (method) {
          assert.isFunction(Producer.prototype[method]);
        }
      );
    },
    "when created": {
      "with no values": {
        topic: godot.producer(),
        "should have the correct defaults": function (producer) {
          var defaults = Producer.prototype.defaults;

          Object.keys(defaults).forEach(function (key) {
            assert.equal(producer.values[key], defaults[key]);
          });
        }
      },
      "with values": {
        topic: function () {
          this.now = new Date();
          this.values = {
            host: '127.0.0.1',
            service: 'godot/test',
            state: 'test',
            description: 'Waiting to test Godot',
            tags: ['test', 'unit'],
            metric: 1,
            ttl: 100
          };
          
          return godot.producer(this.values);
        },
        "should set all values": function (producer) {
          var values = this.values;
          
          Object.keys(values).forEach(function (key) {
            assert.equal(producer.values[key], values[key]);
          });
        },
        "should set the ttlId": function (producer) {
          assert.isObject(producer.ttlId);
          assert.isFunction(producer.ttlId.ontimeout);
        },
        "setting invalid data-types": macros.shouldThrowOnInvalidValues(),
        "setting valid data-types": macros.shouldSetValues(),
        "should producer on the specified TTL": {
          topic: function (producer) {
            producer.once('data', this.callback.bind(null, null));
          },
          "should producer the correct event": function (_, data) {
            var values = this.values;

            assert.isTrue((new Date() - this.now) >= values.ttl);
            Object.keys(values).forEach(function (key) {
              assert.equal(data[key], values[key]);
            });         
          }
        }
      }
    }
  }
}).export(module);