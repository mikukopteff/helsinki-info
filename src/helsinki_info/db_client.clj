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

(defn connect []
  (debug "connecting to mongo")
  (mongo/connect-via-uri! ((utils/props):mongo.uri)))

(defn disconnect []
  (debug "disconnecting from mongo")
  (mongo/disconnect!))

(def search-result-fields [:slug :summary :heading :items :meeting :subject])

(defn- convert-id [event]
  (when (contains? event :_id)
    (assoc event :_id (.toString (get event :_id)))))

(defn- add-id [entity]
  (if (contains? entity :_id)
    entity
    (conj entity {:_id (ObjectId.)})))

(defn- add-ids [coll]
  (map add-id coll))

(defn find-collections [collection]
  (map convert-id (doall (mongo-collection/find-maps collection))))

(defn find-by-case [id]
  (convert-id (mongo-collection/find-one-as-map "cases" {:slug id})))

(defn delete [collection]
  (mongo-collection/remove collection))

(defn insert [data, collection]
  (mongo-collection/insert-batch collection (add-ids data)))

(defn update [data, collection]
  (mongo-collection/update-by-id collection (ObjectId. (get data :_id)) (dissoc data :_id)))

(defn insert-single [element, collection]
  (mongo-collection/insert collection (merge element {:_id (ObjectId.)})))

(defn find-popular-new []
  (mongo-collection/aggregate "cases" [{$unwind "$items"}, {$group {:_id "$slug" :sum_items {$sum 1}}}, {$match {:sum_items {$gte 3}}}]))

(defn find-newest-headings [page, per-page]
  (doall (query/with-collection "cases"
      (query/find {})
      (query/fields search-result-fields)
      (query/sort (sorted-map "items.meeting.date" -1))
      (query/paginate :page page :per-page per-page))))

(defn- search-cases [search-query projection page per-page]
  (doall (query/with-collection "cases"
              (query/find search-query)
              (query/fields projection)
              (query/paginate :page page :per-page per-page))))

(defn search-by-committee [committee_name page per-page]
  (def query {:items.meeting.committee_name committee_name})
  (def projection { :slug 1 :summary 1 :heading 1 :meeting 1 :subject 1 :items { $elemMatch { :meeting.committee_name committee_name } } } )
  (search-cases query projection page per-page))

(defn search-by-date [date-str page per-page]
  (def date-formatter (time-format/formatter "yyyy-MM-dd"))
  (let [search-date (time-format/parse date-formatter date-str)]
    (def query {:items.meeting.date search-date})
    (def projection { :slug 1 :summary 1 :heading 1 :meeting 1 :subject 1 :items { $elemMatch { :meeting.date search-date } } } )
    (search-cases query projection page per-page)))

(defn search [string]
  (map (fn [result] (get result :obj))(search/results-from (search/search "cases" (search-utils/escape-search-string string)))))

(defn count-cases [search-query]
  (mongo-collection/count "cases" search-query))
  
(defn count-cases-by-committee [committee_name]
  (count-cases {:items.meeting.committee_name committee_name}))

(defn count-cases-by-date [date-str]
  (def date-formatter (time-format/formatter "yyyy-MM-dd"))
  (let [search-date (time-format/parse date-formatter date-str)]
    (count-cases {:items.meeting.date search-date})))
