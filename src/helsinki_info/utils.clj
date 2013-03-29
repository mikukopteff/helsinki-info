(ns helsinki-info.utils)

(defn props[] 
  {:mongo.uri 
    (let [mongo-uri (System/getProperty "mongo.uri")]
      (if (nil? mongo-uri) 
        "mongodb://127.0.0.1/open-helsinki"
        mongo-uri))})
