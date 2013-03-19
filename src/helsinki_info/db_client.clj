(ns helsinki-info.db-client
  (:require [monger.core :as mongo])
  (:require [monger.collection :as mongo-collection])
  (:use [clojure.tools.logging :only (info)])
  (:import [com.mongodb MongoOptions ServerAddress]
           [com.mongodb DB WriteConcern]))


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

(defn- events []
  (in-connection
    (fn [] (doall (mongo-collection/find-maps "events")))))

(defn find-events []
  (map #(assoc % :_id (.toString (get % :_id))) (events)))

(defn delete-events []
  (in-connection
    #(mongo-collection/remove "events")))

(defn insert-events [data]
  "This function need to check for oid and then added if it's not there! Check monger _id documentation"
  (in-connection 
    (fn [] (mongo-collection/insert-batch "events" data))))
