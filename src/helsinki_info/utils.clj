(ns helsinki-info.utils)

(defn props[] 
  {:mongo.uri 
    (let [mongo-uri (System/getProperty "mongo.uri")]
      (if (nil? mongo-uri) 
        "mongodb://open-helsinki:test9876@dharma.mongohq.com:10092/open-helsinki-test"
        mongo-uri))})
