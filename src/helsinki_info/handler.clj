(ns helsinki-info.handler
  (:use compojure.core)
  (:require [compojure.handler :as handler]
            [compojure.route :as route]
            [ring.util.codec :as codec]
            [ring.util.response :as resp]
            [helsinki-info.db-client :as db]
            [clojure.data.json :as json]))

(defn success
      [items]
      { :status 200
      :headers {"Content-Type" "application/json"}
      :body (json/write-str items)})

(defn not-found
      [msg]
      { :status 404
      :headers {"Content-Type" "application/json"}
      :body msg })

(defroutes app-routes
  (GET "/" [] (resp/file-response "index.html" {:root "resources/public"}))
  (GET "/ping" [] "pong")
  (GET "/search/:query" [query] 
    (success (db/search (codec/url-decode query))))
  (GET "/item/newest" []
    (success (db/find-newest-headings 4)))
  (GET "/cases" []
    (success (db/find-collections "cases")))
  (GET "/case/:slug" [slug]
    (let [case (db/find-by-case slug)] 
      (if (nil? case) 
        (not-found "Event Item not found")
        (success case))))
  (route/resources "/")
  (route/not-found "Not Found"))

(def app
  (handler/site app-routes))

