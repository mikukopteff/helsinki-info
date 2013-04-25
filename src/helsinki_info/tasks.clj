(ns helsinki-info.tasks
  (:use overtone.at-at)
  (:use helsinki-info.mock-data)
  (:use [clojure.tools.logging :only (info)])
  (:require [helsinki-info.db-client :as db]))

(def pool (mk-pool))

(defn start-scarping[]
  (every 1000 #(info "Running task") pool))

(defn- init-events []
  "This function is here until we have a place to get the actual http data"
  (db/delete "events")
  (db/insert data "events"))

(defn startup[] 
  (println "Starting server")
  (init-events))