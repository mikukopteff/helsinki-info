(ns helsinki-info.test.db-client
  (:use clojure.test  
        helsinki-info.db-client
        helsinki-info.mock-data))

(defn db-setup [f]
  (delete-events)
  (f)
  (delete-events))

(use-fixtures :each db-setup)

(deftest db-insert
  (testing "_id addition to objects"
    (insert-events data)
    (is (= 3 (count (find-events))))))