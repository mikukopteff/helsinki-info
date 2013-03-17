(defproject helsinki-info "0.1.0-SNAPSHOT"
  :description "FIXME: write description"
  :url "http://example.com/FIXME"
  :dependencies [[org.clojure/clojure "1.4.0"]
                 [compojure "1.1.5"]
                 [overtone/at-at "1.1.1"]
                 [com.novemberain/monger "1.4.2"]
                 [org.clojure/data.json "0.2.1"]]
  :plugins [[lein-ring "0.8.2"]]
  :ring {:handler helsinki-info.handler/app,
        :init helsinki-info.tasks/startup }
  :profiles
  {:dev {:dependencies [[ring-mock "0.1.3"]]}})
