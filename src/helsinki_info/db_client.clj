(ns helsinki-info.db-client
  (:refer-clojure :exclude [sort find])
  (:require [monger.joda-time]
            [monger.json]
            [monger.core :as mongo]
            [monger.collection :as mongo-collection]
            [helsinki-info.utils :as utils]
            [clj-time.core :as time]
            [monger.query :as query])
  (:use [clojure.tools.logging])
  (:import [com.mongodb DB WriteConcern]
           [org.bson.types ObjectId]))


(defn- connect []
  (debug "connecting to mongo")
  (mongo/connect-via-uri! ((utils/props):mongo.uri)))

(defn- disconnect []
  (debug "disconnecting from mongo")
  (mongo/disconnect!))

(defn- in-connection [fun]
  "This should probably have a try/finally clause"
  (connect)
  (let [result (fun)]
    (disconnect)
    result))

(defn- convert-id [event]
  (if (contains? event :_id)
    (assoc event :_id (.toString (get event :_id)))))

(defn- add-id [coll]
    (map 
      #(if-not (contains? % :_id) 
        (conj % {:_id (ObjectId.)}) %) coll))

(defn find-collections [collection]
  (in-connection
    (fn [](map #(convert-id %) 
      (doall (mongo-collection/find-maps collection))))))


(defn find-by-case [id]
  (in-connection
    #(convert-id (mongo-collection/find-one-as-map "cases" {:slug id}))))

(defn delete [collection]
  (in-connection
    #(mongo-collection/remove collection)))

(defn insert [data, collection]
  (in-connection 
    #(mongo-collection/insert-batch collection (add-id data))))

(defn update [data, collection]
  (in-connection
      #(mongo-collection/update-by-id collection (ObjectId. (get data :_id)) (dissoc data :_id))))

(defn insert-single [element, collection]
  (in-connection
      #(mongo-collection/insert collection (merge element {:_id (ObjectId.)}))))

(defn find-popular-new []
  "db.cases.aggregate([{$unwind: '$items'}, {$group: {_id: '$slug', sum_items: {$sum: 1}}}, {$match: {sum_items: {$gte: 3}}}]);"
  ;{$match: {'orders.date': {$gte: new Date('01-02-2013'), $lt: new Date('01-03-2013') }}},
  )


