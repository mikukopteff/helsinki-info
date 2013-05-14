(ns helsinki-info.test.openahjo-client
  (:require [clojure.data.json :as json])
  (:use clojure.test  
        helsinki-info.test.utils
        helsinki-info.db-client))

(defn db-setup [f]
  (delete "cases")
  (f))
  ;(delete "cases"))

(use-fixtures :each db-setup)

(deftest openahjo-crawl
  (testing "data is crawled and formatted to open helsinki format"
    (insert-test-data)
    (is (= 3 (count (find-collections "cases")))))
  (testing "fetching will stop when encountering a stored item")
    (insert-test-data)
    (is (= 3 (count (find-collections "cases"))))
    (insert-test-data "test-resources/openahjo-next-5.json")
    (is (= 4 (count (find-collections "cases")))))