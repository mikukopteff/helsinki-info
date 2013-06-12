(ns helsinki-info.utils)


(defn system-prop[k, fallback] 
  (let [value (System/getProperty k)]
      (if (nil? value) 
        fallback
        value)))

(defn props[] 
  {:mongo.uri (system-prop "mongo.uri" "mongodb://127.0.0.1/open-helsinki")
   :env (system-prop "openhelsinki.env" "dev")})

