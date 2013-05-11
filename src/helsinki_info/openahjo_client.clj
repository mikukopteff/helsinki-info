(ns helsinki-info.openahjo-client
  (:require [clj-http.client :as client]
            [clj-time.core :as time]
            [clojure.data.json :as json]
            [helsinki-info.db-client :as db])
  (:use [clojure.tools.logging :only (info)]
        [clojure.set])
  (:import [org.bson.types ObjectId]))

(def base-url "http://dev.hel.fi")

(def agenda-url "/openahjo/v1/agenda_item/?format=json&offset=805&limit=5")

(defn- call-openahjo [url]
  (info "calling openahjo:" url)
  (json/read-str (:body (client/get (str base-url url)))))

(defn- select-case [item]
  (let [case (get item "issue")]
    (let [existing-case (db/find-by-case (get case "slug"))]
      (if (empty? existing-case)
        case
        existing-case))))

(defn- update-existing [case]
  (info "updating an existing case")
  (db/update case "cases"))

(defn- insert-new [case]
  (info "inserting new case")
  (db/insert-single case "cases"))            

(defn- rearrange [item]
 (let [case (select-case item)]
    (let [items (get case :items)]
      (if (nil? items)
        (insert-new (conj case {:items [(dissoc item "issue")]}))
        (update-existing (assoc case :items (conj items (dissoc item "issue"))))))))

(defn fetch-all-items 
  ([] (fetch-all-items (call-openahjo agenda-url)))
  ([data]
  "This function is mainly used to get all the data from the api"
  (doall (map rearrange (get data "objects")))
  (println (get data "meta"))
  (let [next-url (get (get data "meta") "next")]
    (if-not (nil? next-url)
      (fetch-all-items (call-openahjo next-url))
      (info "Last item hit. Stopping items fetching")))))
