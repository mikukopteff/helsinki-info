(ns helsinki-info.test.openahjo-client
  (:use clojure.test  
        helsinki-info.openahjo-client
        helsinki-info.db-client
        helsinki-info.mock-data))

(defn db-setup [f]
  (delete "cases")
  (f)
  (delete "cases"))

(use-fixtures :each db-setup)

(deftest openahjo-crawl
  (testing "data is crawled and formatted to open helsinki format"
    (insert-test-cases data)
    (is (= 5 (count (find-collections "cases"))))))