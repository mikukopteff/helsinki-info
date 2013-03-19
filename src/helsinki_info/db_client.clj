(ns helsinki-info.db-client
  (:require [monger.core :as mongo])
  (:require [monger.collection :as mongo-collection])
  (:import [com.mongodb MongoOptions ServerAddress]
           [com.mongodb DB WriteConcern]))


(defn connect []
  (println "connecting")
  (let [^MongoOptions opts (mongo/mongo-options :threads-allowed-to-block-for-connection-multiplier 300)
      ^ServerAddress sa  (mongo/server-address "127.0.0.1" 27017)]
  (mongo/connect! sa opts)
  (mongo/set-db! (mongo/get-db "open-helsinki"))))

(defn- disconnect []
  (println "disconnecting")
  (mongo/disconnect!))

(defn- in-connection [fun]
  (connect)
  (let [result (fun)]
    (disconnect)
    result))

(defn- events []
  (in-connection
    (fn [] (doall (mongo-collection/find-maps "events")))))

(defn find-events []
  (map #(assoc % :_id (.toString (get % :_id))) (events)))

(defn delete-events []
  (in-connection
    #(mongo-collection/remove "events")))

(def para 
  "Kaupunginvaltuusto päättänee myöntää Helsinki Stadion Oy:lle 240 000 euron suuruisen vakuudettoman lainan urheilu- ja ulkoilulaitosrahaston varoista Sonera Stadiumin katsomon lasittamisen ja kattamisen rahoittamiseen seuraavin ehdoin:
Laina-aika: Laina on maksettava takaisin tasalyhennyksin kymmenen vuoden kuluessa kuitenkin siten, että ensimmäinen vuosi on lyhennyksistä vapaa.
Lainan korko: Lainasta maksettava korko on peruskoron suuruinen.
Lainan erityisehto: Lainansaaja sitoutuu maksamaan lainasta pois sen osuuden, joka ylittää 40 % lopullisista liikuntaviraston vahvistamista kokonaiskustannuksista.")

(defn insert-test-data []
  "This function is here until we have a place to get the actual http data"
  (in-connection 
    (fn [] (mongo-collection/insert-batch "events" [{:heading "§ 5 - Lainan myöntäminen Helsinki Stadion Oy:lle" :paragraph para}
                                              {:heading "Ullanlinnan tontin 7/133/5 ja puistoalueen asemakaavan muuttaminen (nro 12117, Tehtaankatu 1d, Vuorimiehenkatu 8b)" :paragraph (str para para) }
                                              {:heading "Vartiokylän tontin 45475/1 asemakaavan muuttaminen (nro 12139; Vartioharjun hoivakoti)" :paragraph para }]))))
