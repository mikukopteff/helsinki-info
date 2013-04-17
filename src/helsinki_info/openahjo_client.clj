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
  (conj item (call-openahjo (str (get item "meeting") "?format=json"))))

(def agenda-url "/openahjo/v1/agenda_item/?format=json&limit=1")

(defn fetch-all-items []
  "This function is mainly used to get all the data from the api"
  (map combine-meetings ((call-openahjo agenda-url) "objects")))

(defn store-items []
  (db/insert (fetch-all-items) "items"))