import { Meteor } from 'meteor/meteor';
import { CustomersCollection } from './collection';

Meteor.publish('allCustomerss', function publishCustomerss() {
  return CustomersCollection.find({});
});
