(ns helsinki-info.test.utils
  (:require [clojure.data.json :as json])
  (:use clojure.test  
        helsinki-info.openahjo-client))


(defn insert-test-data
  ([] (insert-test-data "test-resources/openahjo-5.json"))
  ([url]
    (doall (fetch-items  (json/read-str (slurp url))))))
    