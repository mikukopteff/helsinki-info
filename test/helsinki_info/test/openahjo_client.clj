(ns helsinki-info.test.openahjo-client
  (:require [clojure.data.json :as json])
  (:use clojure.test  
        helsinki-info.openahjo-client
        helsinki-info.db-client
        helsinki-info.mock-data))

(defn db-setup [f]
  (delete "cases")
  (f)
  (delete "cases"))

;(use-fixtures :each db-setup)

(deftest openahjo-crawl
  (testing "data is crawled and formatted to open helsinki format"
    (fetch-all-items  (json/read-str (slurp "test-resources/openahjo-5.json")))
    (is (= 3 (count (find-collections "cases"))))))