(ns helsinki-info.db-client
  (:require [monger.core :as mongo])
  (:use [monger.collection :only [insert insert-batch]])
  (:import [com.mongodb MongoOptions ServerAddress]
           [org.bson.types ObjectId]
           [com.mongodb DB WriteConcern]))


(defn connect []
  (let [^MongoOptions opts (mongo/mongo-options :threads-allowed-to-block-for-connection-multiplier 300)
      ^ServerAddress sa  (mongo/server-address "127.0.0.1" 27017)]
  (mongo/connect! sa opts)
  (mongo/set-db! (mongo/get-db "open-helsinki"))))

(defn disconnect []
  mongo/disconnect!)

(defn withConnection [fun]
  (connect)
  fun
  (disconnect))

(defn test-data []
  "This function is here until we have a place to get the actual http data"
  (withConnection 
    (monger.collection/insert "events" { :_id (ObjectId.) :first_name "pyh" :last_name "poh" })))