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

(deftest insertions
  (testing "data insertion in correct format"
    (is (= 3 (count (find-collections "cases"))))))

(deftest queries
  (testing "query with newest updates"
    (is (= "hel-2012-013814" (get (first (find-newest-headings 1)) :slug))))
  (testing "query with popular register numbers"
    (is (= "hel-2012-013814" (get (first (find-popular-new)) :_id)))))
