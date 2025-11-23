const _ = require('lodash');

const findFunctions = ['count', 'find', 'findById', 'findOne', 'findOneAndRemove', 'findOneAndUpdate', 'update'];

class Plugins {
  static documentDeleted(schema) {
    findFunctions.forEach(hook => {
      schema.pre(hook, function () {
        const includeDeleted = _.get(this._conditions, 'includeDeleted');
        delete this._conditions.includeDeleted;

        if (includeDeleted === true) {
          delete this._conditions.deleted;
          return;
        }

        if (_.has(this._conditions, 'deleted')) { return; }
        this.where('deleted').ne(true);
      });
    });
  }
}

module.exports = {
  Plugins
};