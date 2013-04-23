(ns helsinki-info.db-client
  (:refer-clojure :exclude [sort find])
  (:require [monger.joda-time]
            [monger.json]
            [monger.core :as mongo]
            [monger.collection :as mongo-collection]
            [helsinki-info.utils :as utils]
            [clj-time.core :as time]
            [monger.query :as query])
  (:use [clojure.tools.logging :only (info)])
  (:import [com.mongodb DB WriteConcern]
           [org.bson.types ObjectId]))


(defn- connect []
  (info "connecting to mongo")
  (mongo/connect-via-uri! ((utils/props):mongo.uri)))

(defn- disconnect []
  (info "disconnecting from mongo")
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

(defn find-event [id]
  (in-connection 
      #(convert-id
        (try 
          (mongo-collection/find-map-by-id "events" (ObjectId. id))
          (catch Exception e)))))

(defn find-by-case [id]
  (in-connection
    (fn [](map #(convert-id %) 
      (doall (mongo-collection/find-maps "cases" {:slug id}))))))

(defn delete [collection]
  (in-connection
    #(mongo-collection/remove collection)))

(defn insert [data, collection]
  (in-connection 
    #(mongo-collection/insert-batch collection (add-id data))))

(defn find-events-by-regnum [regnum]
  (in-connection
    #(doall (query/with-collection "events"
      (query/find {:register-number regnum})
      (query/sort (sorted-map :event-time 1))))))


