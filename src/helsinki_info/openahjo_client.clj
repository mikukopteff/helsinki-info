(ns helsinki-info.openahjo-client
  (:require [clj-http.client :as client]
            [clj-time.core :as time]
            [clojure.data.json :as json]
            [helsinki-info.db-client :as db])
  (:use [clojure.tools.logging :only (info)]
        [clojure.set])
  (:import [org.bson.types ObjectId]))

(def base-url "http://dev.hel.fi")

(def starting-url "/openahjo/v1/agenda_item/?format=json&offset=0&limit=20")

(def new-items-url "/openahjo/v1/agenda_item/?format=json&order_by=-last_modified_time")

(defn- call-openahjo [url]
  (info "calling openahjo:" url)
  (json/read-str (:body (client/get (str base-url url)))))

(defn- select-case [item]
  "Fetches the db case if it is already stored. Case equals issue in the openahjo api"
  (let [case (get item "issue")]
    (let [existing-case (db/find-by-case (get case "slug"))]
      (if (empty? existing-case)
        case
        existing-case))))

(defn- update-existing [case]
  (println "---------------------- updating")
  (info "updating an existing case")
  (db/update case "cases") 
  true)

(defn- update [old-case, new-item, old-items] 
  (if-not (some #(=  (get % :id) (get new-item "id") ) old-items)
    (update-existing (assoc old-case :items (conj old-items (dissoc new-item "issue")))) 
    false))

(defn- insert-new [case]
  (info "inserting new case")
  (db/insert-single case "cases") 
  true)

(defn- sort-items-and-store [item]
  (let [case (select-case item)]
    (let [items (get case :items)]
      (if (nil? items)
        (insert-new (conj case {:items [(dissoc item "issue")]}))
        (update case item items)))))
  

(defn fetch-items 
  ([] (fetch-all-items (call-openahjo new-items-url)))
  ([data]
  (let [added-to-db (doall (take-while true? (map sort-items-and-store (get data "objects"))))]  
    (if (= (count added-to-db) (count (get data "objects")))
      (println "going for next page")
      (let [next-url (get (get data "meta") "next")]
        (if-not (nil? next-url)
          (fetch-all-items (call-openahjo next-url))
          (info "Last item hit. Stopping items fetching")))))))

(defn fetch-new-items []
  (fetch-items (call-openahjo new-items-url)))

(defn fetch-all-items []
  (fetch-items (call-openahjo starting-url)))


