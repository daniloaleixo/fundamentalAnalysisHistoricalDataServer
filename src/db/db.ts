import { DataStore } from 'notarealdb';

const store = new DataStore('./data');

module.exports = {
  users: store.collection('users')
};