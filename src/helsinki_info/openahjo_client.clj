(ns helsinki-info.openahjo-client
  (:require [clj-http.client :as client]
            [clj-time.core :as time]
            [clojure.data.json :as json]
            [helsinki-info.db-client :as db])
  (:use [clojure.tools.logging :only (info)]
        [clojure.set])
  (:import [org.bson.types ObjectId]))

(def base-url "http://dev.hel.fi")

(def agenda-url "/openahjo/v1/agenda_item/?format=json&limit=1")

(defn- call-openahjo [url]
  (info "calling openahjo:" url)
  (json/read-str (:body (client/get (str base-url url)))))

(defn select-case [item]
  (let [case (get item "item")]
    (let [existing-case (db/find-by-case (get case "slug"))]
      (println (empty? existing-case))
      (if (empty? existing-case)
        case
        existing-case))))  

(defn- rearrange [item]
  ;need to check here if case(item) already exists in db, if yes then attach it to the existing one
 (let [case (select-case item)]
    (conj case {:items [(dissoc item "item")]})))

(defn- combine-meetings[item]
  (rearrange (conj item (call-openahjo (str ((get item "meeting") "resource_uri")  "?format=json")))))

(defn fetch-all-items []
  "This function is mainly used to get all the data from the api"
  (map combine-meetings ((call-openahjo agenda-url) "objects")))

(defn store-items-to-cases []
  (db/insert (fetch-all-items) "cases"))