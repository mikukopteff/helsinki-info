(ns helsinki-info.db-client
  (:require [monger.core :as mongo]
            [monger.collection :as mongo-collection]
            [helsinki-info.utils :as utils])
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

(defn- convert-id [events]
  (assoc events :_id (.toString (get events :_id))))

(defn find-events []
  (in-connection
    (fn [](map #(convert-id %) (doall (mongo-collection/find-maps "events"))))))

(defn find-event [id]
  (in-connection
    #(convert-id (mongo-collection/find-one-as-map "events" { :_id (ObjectId. id) }))))

(defn delete-events []
  (in-connection
    #(mongo-collection/remove "events")))

(defn insert-events [data]
  "This function need to check for oid and then added if it's not there! Check monger _id documentation"
  (in-connection 
    #(mongo-collection/insert-batch "events" data)))
