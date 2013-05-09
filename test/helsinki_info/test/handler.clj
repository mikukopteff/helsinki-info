(ns helsinki-info.test.handler
  (:require [clojure.data.json :as json])
  (:require [helsinki-info.db-client :as db])
  (:require [helsinki-info.tasks :as tasks])
  (:use clojure.test
        ring.mock.request  
        helsinki-info.handler))

(defn parse-json [response]
  (json/read-str (:body response)))

(defn db-setup [f]
  (tasks/startup)
  (f)
  (db/delete "events"))

(use-fixtures :each db-setup)
(comment

(deftest test-app
  (testing "events route"
    (let [response (app (request :get "/cases"))]
      (is (= (:status response) 200))
      (is (= (get (first (parse-json response)) "heading") "§ 5 - Lainan myöntäminen Helsinki Stadion Oy:lle"))
      (is (= (count (parse-json response)) 5))))

  (testing "single event fetching with id"
    (let [response (app (request :get "/event/51558fcb0364623664defe36"))]
      (is (= (:status response) 200))
      (is (= (get (parse-json response) "heading") "§ 5 - Lainan myöntäminen Helsinki Stadion Oy:lle"))
      (is (= (get (parse-json response) "_id") "51558fcb0364623664defe36"))))

  (testing "single event fetching with id"
    (let [response (app (request :get "/event/this-id-is-probably-nonexistent"))]
      (is (= (:status response) 404))))
  
  (testing "not-found route"
    (let [response (app (request :get "/invalid"))]
      (is (= (:status response) 404))))

  (testing "base root redirect route"
    (let [response (app (request :get "/"))]
      (is (= (:status response) 200))
      (is (instance? java.io.File (:body response)))
      (is (= (.getPath (:body response)) "resources/public/index.html" )))))
)