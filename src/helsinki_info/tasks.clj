(ns helsinki-info.tasks
  (:use overtone.at-at)
  (:use [clojure.tools.logging :only (info)])
  (:require [helsinki-info.db-client :as db]
            [clojure.data.json :as json]
            [helsinki-info.openahjo-client :as openahjo]))
  

(def pool (mk-pool))

(defn start-scarping[]
  (every 1000 #(info "Running task") pool))

(defn- init-events []
  "This function is here until we have a place to get the actual http data"
  (db/delete "events")
  (doall (openahjo/fetch-all-items  (json/read-str (slurp "test-resources/openahjo.json")))))

(defn startup[] 
  (println "Starting server")
  (init-events))