(ns helsinki-info.test.handler
  (:require [clojure.data.json :as json])
  (:require [helsinki-info.db-client :as db])
  (:require [helsinki-info.openahjo-client :as openahjo])
  (:require [helsinki-info.tasks :as tasks])
  (:use clojure.test
        ring.mock.request  
        helsinki-info.handler))

(defn parse-json [response]
  (json/read-str (:body response)))

(defn db-setup [f]
  (db/delete "cases")
  (doall (openahjo/fetch-all-items  (json/read-str (slurp "test-resources/openahjo-5.json"))))
  (f)
  (db/delete "cases"))

(use-fixtures :each db-setup)


(deftest test-app
  (testing "cases route"
    (let [response (app (request :get "/cases"))]
      (is (= (:status response) 200))
      (is (= (get (first (parse-json response)) "summary") "SFHP ry järjestää XXXV valtakunnallisen asunto- ja yhdyskuntapäivän torstaina 16.5.2013 Helsingin yliopiston Päärakennuksessa."))
      (is (= (count (parse-json response)) 3))))

  (testing "case fetching with slug"
    (let [response (app (request :get "/case/hel-2012-013814"))]
      (is (= (:status response) 200))
      (is (= (get (parse-json response) "summary") "Valtuutettu Kauko Koskinen ja 18 muuta valtuutettua esittävät aloitteessaan, että selvitettäisiin, miksi aravuokra-asuntojen rakennuskustannukset ovat Helsingissä muuta maata korkeammat."))
      (is (= (get (parse-json response) "subject") "Kiinteistölautakunnan lausunto kaupunginhallitukselle kaupunginvaltuutettu Kauko Koskisen valtuustoaloitteesta koskien kaupungin asuntorakentamisen kustannuksia Helsingissä"))))

  (testing "single event fetching with id"
    (let [response (app (request :get "/case/this-id-is-probably-nonexistent"))]
      (is (= (:status response) 404))))
  
  (testing "not-found route"
    (let [response (app (request :get "/invalid"))]
      (is (= (:status response) 404))))

  (testing "base root redirect route"
    (let [response (app (request :get "/"))]
      (is (= (:status response) 200))
      (is (instance? java.io.File (:body response)))
      (is (= (.getPath (:body response)) "resources/public/index.html" )))))
