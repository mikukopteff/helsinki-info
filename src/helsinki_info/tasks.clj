(ns helsinki-info.tasks
  (:use overtone.at-at)
  (:use [clojure.tools.logging :only (info)])
  (:require [helsinki-info.db-client :as db]
            [clojure.data.json :as json]
            [helsinki-info.openahjo-client :as openahjo]
            [helsinki-info.utils :as utils]))
  

(def pool (mk-pool))

(defn start-scraping[]
  (every 600000 #(openahjo/fetch-new-items) pool :initial-delay 10000))

(defn migrate-data-and-crawl []
  (if (= (count (db/find-collections "cases")) 0)
      (doall (openahjo/fetch-all-items))
  (start-scraping)))

(defn- init-cases []
  (let [env (get (utils/props) :env)]
    (info (str "Running in environment:" env))
      (if-not (= env "prod")
        (openahjo/fetch-items  (json/read-str (slurp "test-resources/openahjo.json")))
        (migrate-data-and-crawl))))

(defn startup[] 
  (info "Starting server")
  (init-cases))