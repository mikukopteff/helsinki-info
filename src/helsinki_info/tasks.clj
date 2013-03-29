(ns helsinki-info.tasks
  (:use overtone.at-at)
  (:use [clojure.tools.logging :only (info)])
  (:require [helsinki-info.db-client :as db])
  (:import [org.bson.types ObjectId]))

(def pool (mk-pool))

(defn start-scarping[]
  (every 1000 #(info "Running task") pool))

(def para 
  "Kaupunginvaltuusto päättänee myöntää Helsinki Stadion Oy:lle 240 000 euron suuruisen vakuudettoman lainan urheilu- ja ulkoilulaitosrahaston varoista Sonera Stadiumin katsomon lasittamisen ja kattamisen rahoittamiseen seuraavin ehdoin:
Laina-aika: Laina on maksettava takaisin tasalyhennyksin kymmenen vuoden kuluessa kuitenkin siten, että ensimmäinen vuosi on lyhennyksistä vapaa.
Lainan korko: Lainasta maksettava korko on peruskoron suuruinen.
Lainan erityisehto: Lainansaaja sitoutuu maksamaan lainasta pois sen osuuden, joka ylittää 40 % lopullisista liikuntaviraston vahvistamista kokonaiskustannuksista.")

(defn- init-events []
  "This function is here until we have a place to get the actual http data"
  (db/delete-events)
  (db/insert-events [{:_id (ObjectId. "51558fcb0364623664defe36")
                      :heading "§ 5 - Lainan myöntäminen Helsinki Stadion Oy:lle" :register-number "HEL 2012-004159" 
                      :category "10 06 00 Rakennusten ja rakennelmien suunnittelu ja toteutus" :decision-text para
                      :attachments "" :summary para}
                     {:heading "Ullanlinnan tontin 7/133/5 ja puistoalueen asemakaavan muuttaminen (nro 12117, Tehtaankatu 1d, Vuorimiehenkatu 8b)" :register-number "HEL 2012-004323" 
                      :category "10 06 00 Rakennusten ja rakennelmien suunnittelu ja toteutus" :decision-text para
                      :attachments "" :summary (str para para)}
                        {:heading "Vartiokylän tontin 45475/1 asemakaavan muuttaminen (nro 12139; Vartioharjun hoivakoti)" :register-number "HEL 2012-004186" 
                      :category "10 06 00 Rakennusten ja rakennelmien suunnittelu ja toteutus" :decision-text para
                      :attachments "" :summary para}]))

(defn startup[] 
  (println "Starting server")
  (init-events))