(ns helsinki-info.openahjo-client
  (:require [clj-http.client :as client]
            [clj-time.core :as time]
            [clojure.data.json :as json]
            [helsinki-info.db-client :as db])
  (:use [clojure.tools.logging :only (info)]
        [clojure.set])
  (:import [org.bson.types ObjectId]))

(def base-url "http://dev.hel.fi")

(def agenda-url "/openahjo/v1/agenda_item/?format=json&offset=10&limit=10")

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

(defn fetch-all-items [url]
  "This function is mainly used to get all the data from the api"
  (map rearrange (get (call-openahjo url) "objects")))

