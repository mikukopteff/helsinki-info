(ns helsinki-info.openahjo-client
  (:require [clj-http.client :as client]
            [clj-time.core :as time]
            [clojure.data.json :as json]
            [helsinki-info.db-client :as db])
  (:use [clojure.tools.logging :only (info)]
        [clojure.set]
        [clj-time.format]
        [clojure.walk])
  (:import [org.bson.types ObjectId]))

(def base-url "http://dev.hel.fi")

(def starting-url "/openahjo/v1/agenda_item/?format=json&offset=0&limit=20")

(def new-items-url "/openahjo/v1/agenda_item/?format=json&order_by=-last_modified_time")

(defn- call-openahjo [url]
  (info "calling openahjo:" url)
  (json/read-str (:body (client/get (str base-url url)))))

(defn- select-case [item]
  "Fetches the db case if it is already stored. Case equals issue in the openahjo api"
  (let [case (get item :issue)
        existing-case (db/find-by-case (get case :slug))]
    (if (empty? existing-case)
      case
      existing-case)))

(defn- update-existing [case]
  (info "updating an existing case")
  (db/update case "cases") 
  true)

(defn- update [old-case, new-item, old-items] 
  (if-not (some #(=  (get % :id) (get new-item :id) ) old-items)
    (do (let [all-items (conj old-items (dissoc new-item :issue))]
      (update-existing (assoc old-case :items (sort-by (comp :date :meeting) all-items)))))
  false))

(defn- insert-new [case]
  (info "inserting new case")
  (db/insert-single case "cases") 
  true)

(def custom-formatter (formatter "yyyy-MM-dd"))

(defn convert-date [item]
  (let [meeting (get item :meeting)]
    (assoc item :meeting (assoc meeting :date (parse custom-formatter (get meeting :date))))))

(defn- sort-items-and-store [item]
  (let [new-item (convert-date item)
        case (select-case item)]
    (if-let [items (get case :items)]
      (update case new-item items)
      (insert-new (conj case {:items [(dissoc new-item :issue)]})))))

(defn fetch-items 
  ([] (fetch-items (call-openahjo new-items-url)))
  ([data]
  (let [added-to-db (doall (take-while true? (map sort-items-and-store (get (keywordize-keys data) :objects))))]
    (info (str "Items updated:" (count added-to-db)))
    (if (= (count added-to-db) (count (get data "objects")))
      (do (info "Only new items found. All updated.")
        (let [next-url (get (get data "meta") "next")]
          (if-not (nil? next-url)
            (fetch-items (call-openahjo next-url))
            (info "Last item hit. Stopping items fetching"))))
      (info "Found items that were in the db. Not looking for more.")))))

(defn fetch-new-items []
  (info "Checking for new items in openahjo api")
  (fetch-items (call-openahjo new-items-url)))

(defn fetch-all-items []
  (info "Fetching all data from openahjo api")
  (fetch-items (call-openahjo starting-url)))


