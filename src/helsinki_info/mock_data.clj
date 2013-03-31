(ns helsinki-info.mock-data
  (:require [clj-time.core :as time])
  (:import [org.bson.types ObjectId]))

(def para 
  "Kaupunginvaltuusto päättänee myöntää Helsinki Stadion Oy:lle 240 000 euron suuruisen vakuudettoman lainan urheilu- ja ulkoilulaitosrahaston varoista Sonera Stadiumin katsomon lasittamisen ja kattamisen rahoittamiseen seuraavin ehdoin:
Laina-aika: Laina on maksettava takaisin tasalyhennyksin kymmenen vuoden kuluessa kuitenkin siten, että ensimmäinen vuosi on lyhennyksistä vapaa.
Lainan korko: Lainasta maksettava korko on peruskoron suuruinen.
Lainan erityisehto: Lainansaaja sitoutuu maksamaan lainasta pois sen osuuden, joka ylittää 40 % lopullisista liikuntaviraston vahvistamista kokonaiskustannuksista.")


(def data 
  [{:_id (ObjectId. "51558fcb0364623664defe36")
                      :heading "§ 5 - Lainan myöntäminen Helsinki Stadion Oy:lle" :register-number "HEL 2012-004159" 
                      :category "10 06 00 Rakennusten ja rakennelmien suunnittelu ja toteutus" :decision-text para
                      :attachments "" :summary para :publish-time  (time/now) :event-time (time/date-time 2013 3 20)}
                      {:heading "Ullanlinnan tontin 7/133/5 ja puistoalueen asemakaavan muuttaminen (nro 12117, Tehtaankatu 1d, Vuorimiehenkatu 8b)" :register-number "HEL 2012-004323" 
                      :category "10 06 00 Rakennusten ja rakennelmien suunnittelu ja toteutus" :decision-text para
                      :attachments "" :summary (str para para) :publish-time (time/date-time 2013 03 14 4 3 27) :event-time (time/date-time 2013 3 19)}
                      {:heading "Vartiokylän tontin 45475/1 asemakaavan muuttaminen (nro 12139; Vartioharjun hoivakoti)" :register-number "HEL 2012-004186" 
                      :category "10 08 00 Joku Kategoriatieto jne" :decision-text para
                      :attachments "" :summary para :publish-time (time/date-time 2013 01 17 4 3 27) :event-time (time/date-time 2012 07 03)}
                      {:heading "Helsingin Stadion Oy:n käsittely liittyen lainaan" :register-number "HEL 2012-004159" 
                      :category "10 06 00 Rakennusten ja rakennelmien suunnittelu ja toteutus" :decision-text para
                      :attachments "" :summary (str para para) :publish-time (time/date-time 2012 06 21 4 3 27) :event-time (time/date-time 2013 6 21)}
                      {:heading "Ehdotus liittyen Helsingin Stadion Oy:n lainaan" :register-number "HEL 2012-004159" 
                      :category "10 06 00 Rakennusten ja rakennelmien suunnittelu ja toteutus" :decision-text para
                      :attachments "" :summary (str para para) :publish-time (time/date-time 2012 04 10 4 3 27) :event-time (time/date-time 2012 4 12)}])