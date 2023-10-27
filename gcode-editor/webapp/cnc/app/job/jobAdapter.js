"use strict";

define(['Ember', 'EmberData'], function (Ember, DS) {

    // this adapter is also used for JobSummary.
    // jobsummry is a model of job that just shows a few fields and doesn't trigger a full toolpath computation.
    // it's used for the job list on the front page
    // by using the same adapter, the same on disk data get either hydrated as a Job or a JobSummary
    return DS.Adapter.extend({
        init() {
            return new Ember.RSVP.Promise(function (resolve, reject) {
                var request = window.indexedDB.open("Jobs", 2);
                request.onerror = function (event) {
                    reject(event.target.errorCode)
                }
                request.onupgradeneeded = function (event) {
                    var db = event.target.result;
                    db.createObjectStore("jobs", {autoIncrement: true});
                }
                request.onsuccess = function (event) {
                    resolve();
                }
            });
        },
        openDB() {
            return new Ember.RSVP.Promise(function (resolve, reject) {
                var request = window.indexedDB.open("Jobs", 2);
                request.onerror = function (event) {
                    reject(event.target.errorCode)
                }
                request.onsuccess = function (event) {
                    event.target.result;
                    resolve(event.target.result);
                }
            });
        },
        makeQuery(idbQueryFunction) {
            return this.openDB().then(function (db) {
                let idbObjectStore = db.transaction(["jobs"], "readwrite").objectStore("jobs");
                var request = idbQueryFunction(idbObjectStore);
                return new Ember.RSVP.Promise(function (resolve, reject) {
                    request.onsuccess = function (event) {
                        resolve(event.target.result);
                    };
                    request.onerror = function (event) {
                        console.error('IndexedDB error: ' + event.target.errorCode);
                        reject(event);
                    };
                });
            });
        },
        find: function (store, type, id, opts) {
            return this.makeQuery(function (objectStore) {
                return objectStore.get(parseInt(id));
            }).then(function (data) {
                if (data)
                    data.id = id;
                return data
            });
        },
        findRecord: function (store, type, id, opts) {
            console.log('JobAdapter.find()')
        },
        createRecord: function (store, type, snapshot) {
            var data = this.serialize(snapshot);
            return this.makeQuery(function (objectStore) {
                return objectStore.add(data);
            }).then(function (id) {
                data.id = id;
                return data
            });
        },
        updateRecord: function (store, type, snapshot) {
            var data = snapshot.serialize();
            return this.makeQuery(function (objectStore) {
                return objectStore.put(data, parseInt(snapshot.id));
            }).then(function () {
                data.id = snapshot.id;
                return data;
            });
        },
        deleteRecord: function (store, type, snapshot) {
            return this.makeQuery(function (objectStore) {
                return objectStore.delete(parseInt(snapshot.id));
            }).then(function () {
                return true;
            });
        },
        findAll: function (store, type) {
            var result = [];
            return this.openDB().then(function (db) {
                var request = db.transaction(["jobs"], "readonly").objectStore("jobs").openCursor();
                return new Ember.RSVP.Promise(function (resolve, reject) {
                    request.onsuccess = function (event) {
                        let cursor = event.target.result;
                        if (cursor) {
                            result.push({...cursor.value, id: cursor.primaryKey + ''})
                            cursor.continue();
                        } else {
                            Ember.run(null, resolve, result);
                        }
                    };
                    request.onerror = function (event) {
                        console.log('IndexedDB error: ' + event.target.errorCode);
                        reject(event);
                    };
                });
            });
        },
        query: function (records, query) {
            return []
        }
    });

});