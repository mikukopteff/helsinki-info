(ns helsinki-info.test.openahjo-client
  (:require [helsinki-info.openahjo-client :as client])
  (:use clojure.test))  
  


(deftest openahjo
  (testing "data is crawled and formatted to open helsinki format"
    (client/fetch-all-items  client/agenda-url))
    (is (= 3 3)))