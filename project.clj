(defproject helsinki-info "0.1.0-SNAPSHOT"
  :description "FIXME: write description"
  :url "http://example.com/FIXME"
  :dependencies [[org.clojure/clojure "1.5.0"]
                 [compojure "1.1.5"]
                 [overtone/at-at "1.1.1"]
                 [com.novemberain/monger "1.5.0"]
                 [org.clojure/data.json "0.2.1"]
                 [org.clojure/tools.logging "0.2.6"]
                 [clj-time "0.5.0"]
                 [cheshire "5.0.2"]
                 [log4j "1.2.17"]
                 [clj-http "0.7.1"]]
  :plugins [[lein-ring "0.8.2"]
            [lein-cloudbees "1.0.3"]]
  :ring {:handler helsinki-info.handler/app,
        :init helsinki-info.tasks/startup }
  :cloudbees-app-id "miku/helsinki-info"
  :profiles
  {:dev {:dependencies [[ring-mock "0.1.3"]]}})
