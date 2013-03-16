(ns helsinki-info.handler
  (:use compojure.core)
  (:require [compojure.handler :as handler]
            [compojure.route :as route]
            [ring.util.response :as resp]
            [helsinki-info.db-client :as db]))

(defroutes app-routes
  (GET "/" [] (resp/file-response "index.html" {:root "resources/public"}))
  (GET "/ping" [] "pong")
  (GET "/events" [] (db/find-events))
  (route/resources "/")
  (route/not-found "Not Found"))

(def app
  (handler/site app-routes))

