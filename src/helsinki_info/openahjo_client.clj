(ns helsinki-info.openahjo-client
  (:require [clj-http.client :as client]
            [clj-time.core :as time]
            [clojure.data.json :as json])
  (:use [clojure.tools.logging :only (info)])
  (:import [org.bson.types ObjectId]))

(def base-url "http://dev.hel.fi")

(def agenda-url "/openahjo/v1/agenda_item/?format=json&limit=1")

(defn- call-openahjo [url]
  (info "calling openahjo:" url)
  (json/read-str (:body (client/get (str base-url url)))))

(defn- combine-meetings[item]
  (conj item (call-openahjo (str (get item "meeting") "?format=json"))))


(defn fetch-new-items []
  (map combine-meetings ((call-openahjo agenda-url) "objects")))
