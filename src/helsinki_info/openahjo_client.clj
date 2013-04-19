(ns helsinki-info.openahjo-client
  (:require [clj-http.client :as client]
            [clj-time.core :as time]
            [clojure.data.json :as json]
            [helsinki-info.db-client :as db])
  (:use [clojure.tools.logging :only (info)]
        [clojure.set])
  (:import [org.bson.types ObjectId]))

(def base-url "http://dev.hel.fi")

(defn- call-openahjo [url]
  (info "calling openahjo:" url)
  (json/read-str (:body (client/get (str base-url url)))))

(defn- combine-meetings[item]
  (rearrange (conj item (call-openahjo (str (get item "meeting") "?format=json")))))

(def agenda-url "/openahjo/v1/agenda_item/?format=json&limit=1")

(defn fetch-all-items []
  "This function is mainly used to get all the data from the api"
  (map combine-meetings ((call-openahjo agenda-url) "objects")))

(defn rearrange [agenda-item]
  ;need to check here if case already exists in db, if yes, then jsut add the rest there, else switch the items with case and boom!
 (let [item (get agenda-item "item")]
    (dissoc agenda-item "item")
    (conj item {:agenda-items [agenda-item]})))

(defn store-items []
  ;check if db has already with reg id, then add it there if it exists
  (db/insert (fetch-all-items) "items"))