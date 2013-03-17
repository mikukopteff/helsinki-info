(ns helsinki-info.test.handler
  (:use clojure.test
        ring.mock.request  
        helsinki-info.handler))

(deftest test-app
  (testing "main route"
    (let [response (app (request :get "/hello"))]
      (is (= (:status response) 200))
      (is (= (:body response) "Hello World"))))

  (testing "events"
    (let [response (app (request :get "/events"))]
      (is (= (:status response) 200))
      (is (= (:body response) ""))))
  
  (testing "not-found route"
    (let [response (app (request :get "/invalid"))]
      (is (= (:status response) 404))))

  (testing "base root redirect route"
    (let [response (app (request :get "/"))]
      (is (= (:status response) 200))
      (is (instance? java.io.File (:body response)))
      (is (= (.getPath (:body response)) "resources/public/index.html" )))))