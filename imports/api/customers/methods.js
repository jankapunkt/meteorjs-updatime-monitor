import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { CustomersCollection } from './collection';

export async function create(data) {
  return CustomersCollection.insertAsync({ ...data });
}

export async function update(_id, data) {
  check(_id, String);
  return CustomersCollection.updateAsync(_id, { ...data });
}

export async function remove(_id) {
  check(_id, String);
  return CustomersCollection.removeAsync(_id);
}

export async function findById(_id) {
  check(_id, String);
  return CustomersCollection.findOneAsync(_id);
}

Meteor.methods({
  'Customers.create': create,
  'Customers.update': update,
  'Customers.remove': remove,
  'Customers.find': findById
});
