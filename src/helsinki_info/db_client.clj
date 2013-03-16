(ns helsinki-info.db-client
  (:require [monger.core :as mongo])
  (:use [monger.collection :only [insert insert-batch]])
  (:import [com.mongodb MongoOptions ServerAddress]
           [com.mongodb DB WriteConcern]))


(defn- connect []
  (let [^MongoOptions opts (mongo/mongo-options :threads-allowed-to-block-for-connection-multiplier 300)
      ^ServerAddress sa  (mongo/server-address "127.0.0.1" 27017)]
  (mongo/connect! sa opts)
  (mongo/set-db! (mongo/get-db "open-helsinki"))))

(defn- disconnect []
  mongo/disconnect!)

(defn- withConnection [fun]
  (connect)
  (let [result fun]
  (disconnect)
  result))

(def para 
  "Donec id elit non mi porta gravida at eget metus. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Etiam porta sem malesuada magna mollis euismod. Donec sed odio dui.")

(defn find-events []
  (withConnection
    (monger.collection/find-maps "events")))

(defn insert-test-data []
  "This function is here until we have a place to get the actual http data"
  (withConnection 
    (monger.collection/insert-batch "events" [{:heading "Decision made - maybe!" :paragraph para }
                                              {:heading "Another decision!" :paragraph para }
                                              {:heading "Decision decisions" :paragraph para }])))