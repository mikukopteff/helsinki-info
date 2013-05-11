(ns helsinki-info.test.db-client
  (:use clojure.test  
        helsinki-info.db-client
        helsinki-info.test.utils))

(defn db-setup [f]
  (delete "cases")
  (f)
  (delete "cases"))

(use-fixtures :each db-setup)

(deftest db-insert
  (testing "_id addition to objects"
    (insert-test-data)
    (is (= 3 (count (find-collections "cases"))))))