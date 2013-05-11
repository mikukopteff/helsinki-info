(ns helsinki-info.test.utils
  (:require [clojure.data.json :as json])
  (:use clojure.test  
        helsinki-info.openahjo-client))


(defn insert-test-data []
  (doall (fetch-all-items  (json/read-str (slurp "test-resources/openahjo-5.json")))))
    