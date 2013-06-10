(ns helsinki-info.db-client
  (:refer-clojure :exclude [sort find])
  (:require [monger.joda-time]
            [monger.json]
            [monger.core :as mongo]
            [monger.collection :as mongo-collection]
            [helsinki-info.utils :as utils]
            [helsinki-info.search-utils :as search-utils]
            [clj-time.core :as time]
            [clj-time.format :as time-format]
            [monger.query :as query]
            [monger.search :as search])
  (:use [clojure.tools.logging]
        [monger.operators]
        [clj-time.format])
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

(def search-result-fields [:slug :summary :heading :items :meeting :subject])

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
  (in-connection
    #(mongo-collection/aggregate "cases" [{$unwind "$items"}, {$group {:_id "$slug" :sum_items {$sum 1}}}, {$match {:sum_items {$gte 3}}}])))

(defn find-newest-headings [amount]
  (in-connection
    #(doall (query/with-collection "cases"
      (query/find {})
      (query/fields search-result-fields)
      (query/sort (sorted-map "items.meeting.date" -1))
      (query/limit amount)))))

(defn- search-cases [search-query page per-page]
  (in-connection
    #(doall (query/with-collection "cases"
              (query/find search-query)
              (query/fields search-result-fields)
              (query/paginate :page page :per-page per-page)))))

(defn search-by-committee [committee_name page per-page]
  (search-cases {:items.meeting.committee_name committee_name} page per-page))

(defn search-by-date [date-str page per-page]
  (def date-formatter (time-format/formatter "yyyy-MM-dd"))
  (let [search-date (time-format/parse date-formatter date-str)]
    (search-cases {:items.meeting.date search-date} page per-page)))

(defn search [string]
  (in-connection
    #(map (fn [result] (get result :obj))(search/results-from (search/search "cases" (search-utils/escape-search-string string))))))


