(ns helsinki-info.handler
  (:use compojure.core)
  (:require [compojure.handler :as handler]
            [compojure.route :as route]
            [ring.util.response :as resp]
            [helsinki-info.db-client :as db]
            [clojure.data.json :as json]))

(defroutes app-routes
  (GET "/" [] (resp/file-response "index.html" {:root "resources/public"}))
  (GET "/ping" [] "pong")
  (GET "/events" []
    {:status 200
     :headers {"Content-Type" "application/json"}
     :body (json/write-str (db/find-events))})
  (GET "/event/:id" [id]
    {:status 200
     :headers {"Content-Type" "application/json"}
     :body (json/write-str (db/find-event id))})
  (route/resources "/")
  (route/not-found "Not Found"))

(def app
  (handler/site app-routes))

