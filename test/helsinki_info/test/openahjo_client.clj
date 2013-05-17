(ns helsinki-info.test.openahjo-client
  (:require [clojure.data.json :as json])
  (:use clojure.test  
        helsinki-info.test.utils
        helsinki-info.db-client
        clj-time.format
        clj-time.core))

(defn db-setup [f]
  (delete "cases")
  (f)
  (delete "cases"))

(use-fixtures :each db-setup)

(def time-formatter (formatter "yyyy-MM-dd"))

(deftest openahjo-crawl
  (testing "data is crawled and formatted to open helsinki format"
    (insert-test-data)
    (is (= 3 (count (find-collections "cases")))))
  (testing "fetching will stop when encountering a stored item")
    (insert-test-data)
    (is (= 3 (count (find-collections "cases"))))
    (insert-test-data "test-resources/openahjo-next-5.json")
    (is (= 4 (count (find-collections "cases"))))
  (testing "items are added correctly in cases"
    (let [case (find-by-case "hel-2012-013814")]
      (is (= 3 (count (get case :items))))
      (is (= "HEL 2012-013814" (get case :register_id)))
      (is (= 380 (get (first (get case :items)) :id)))
      (is (= "2013-03-21" (unparse time-formatter (get (get (first (get case :items)) :meeting) :date))))
      (is (= "Kiinteistölautakunta" (get (get (first (get case :items)) :meeting) :committee_name))))))