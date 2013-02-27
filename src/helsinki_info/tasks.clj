(ns helsinki-info.tasks
  (:use overtone.at-at))

(defn startup[] 
  (println "Starting server"))

(def pool (mk-pool))

(every 1000 #(println "Running task") pool)