(ns helsinki-info.db-client
  (:require [monger.core :as mongo]
            [monger.collection :as mongo-collection])
  (:use [clojure.tools.logging :only (info)])
  (:import [com.mongodb MongoOptions ServerAddress]
           [com.mongodb DB WriteConcern]
           [org.bson.types ObjectId]))


(defn connect []
  (info "connecting to mongo")
  (let [^MongoOptions opts (mongo/mongo-options :threads-allowed-to-block-for-connection-multiplier 300)
      ^ServerAddress sa  (mongo/server-address "127.0.0.1" 27017)]
  (mongo/connect! sa opts)
  (mongo/set-db! (mongo/get-db "open-helsinki"))))

(defn- disconnect []
  (info "disconnecting from mongo")
  (mongo/disconnect!))

(defn- in-connection [fun]
  (connect)
  (let [result (fun)]
    (disconnect)
    result))

(defn- convert-id [events]
  (assoc events :_id (.toString (get events :_id))))

(defn- events []
  (in-connection
    #(doall (mongo-collection/find-maps "events"))))

(defn find-events []
  (map #(convert-id %) (events)))

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
