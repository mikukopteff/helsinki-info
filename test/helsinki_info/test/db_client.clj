(ns helsinki-info.test.db-client
  (:use clojure.test  
        helsinki-info.db-client
        helsinki-info.test.utils))

(defn db-setup [f]
  (delete "cases")
  (insert-test-data)
  (f)
  (delete "cases"))

(use-fixtures :each db-setup)

(deftest db-insert
  (testing "data insertion in correct format"
    (is (= 3 (count (find-collections "cases"))))))