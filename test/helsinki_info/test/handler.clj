(ns helsinki-info.test.handler
  (:require [clojure.data.json :as json])
  (:use clojure.test
        ring.mock.request  
        helsinki-info.handler))

(defn parse-json [response]
  (json/read-str (:body response)))

(deftest test-app
  (testing "events route"
    (let [response (app (request :get "/events"))]
      (is (= (:status response) 200))
      (is (= (get (first (parse-json response)) "heading") "Decision made - maybe!"))))
  
  (testing "not-found route"
    (let [response (app (request :get "/invalid"))]
      (is (= (:status response) 404))))

  (testing "base root redirect route"
    (let [response (app (request :get "/"))]
      (is (= (:status response) 200))
      (is (instance? java.io.File (:body response)))
      (is (= (.getPath (:body response)) "resources/public/index.html" )))))