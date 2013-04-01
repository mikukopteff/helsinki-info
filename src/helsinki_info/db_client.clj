(ns helsinki-info.db-client
  (:require [monger.joda-time]
            [monger.json]
            [monger.core :as mongo]
            [monger.collection :as mongo-collection]
            [helsinki-info.utils :as utils]
            [clj-time.core :as time])
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

(defn add-id [events]
    (map 
      #(if-not (contains? % :_id) 
        (conj % {:_id (ObjectId.)}) %) events))

(defn find-events []
  (in-connection
    (fn [](map #(convert-id %) 
      (doall (mongo-collection/find-maps "events"))))))

(defn find-event [id]
  (in-connection 
      #(convert-id
        (try 
          (mongo-collection/find-map-by-id "events" (ObjectId. id))
          (catch Exception e)))))

(defn delete-events []
  (in-connection
    #(mongo-collection/remove "events")))

(defn insert-events [data]
  "This function need to check for oid and then added if it's not there! Check monger _id documentation"
  (in-connection 
    #(mongo-collection/insert-batch "events" (add-id data))))
