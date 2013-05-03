(ns helsinki-info.openahjo-client
  (:require [clj-http.client :as client]
            [clj-time.core :as time]
            [clojure.data.json :as json]
            [helsinki-info.db-client :as db])
  (:use [clojure.tools.logging :only (info)]
        [clojure.set])
  (:import [org.bson.types ObjectId]))

(def base-url "http://dev.hel.fi")

(def agenda-url "/openahjo/v1/agenda_item/?format=json&offset=10&limit=4")

(defn- call-openahjo [url]
  (info "calling openahjo:" url)
  (json/read-str (:body (client/get (str base-url url)))))

(defn select-case [item]
  (let [case (get item "item")]
    (let [existing-case (db/find-by-case (get case "slug"))]
      (if (empty? existing-case)
        case
        existing-case))))

(defn update-existing [case]
  (info "updating an existing case")
  (db/update case "cases"))

(defn insert-new [case]
  (info "inserting new case")
  (db/insert-single case "cases"))            

(defn- rearrange [item]
 (let [case (select-case item)]
    (let [items (get case :items)]
      (if (nil? items)
        (insert-new (conj case {:items [(dissoc item "item")]}))
        (update-existing (assoc case :items (conj items (dissoc item "item"))))))))

(defn- combine-meetings[item]
  (rearrange (conj item (call-openahjo (str ((get item "meeting") "resource_uri")  "?format=json")))))

(defn fetch-all-items []
  "This function is mainly used to get all the data from the api"
  (map combine-meetings ((call-openahjo agenda-url) "objects")))
