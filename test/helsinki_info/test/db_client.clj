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
    (is (= 3 (count (find-collections "cases")))))
  (testing "items are added correctly in cases"
    (let [case (find-by-case "hel-2012-013814")]
      (is (= 3 (count (get case :items))))
      (is (= "HEL 2012-013814" (get case :register_id)))
      (is (= 380 (get (first (get case :items)) :id)))
      (is (= "Kiinteistölautakunta" (get (get (first (get case :items)) :meeting) :committee_name))))))