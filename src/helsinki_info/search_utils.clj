(ns helsinki-info.search-utils
  (:require [clojure.string :as string]))

(defn escape-search-string [search-string]
  (defn escape-hyphenated [s]
    (if (re-matches #".(.*)-(.*)." s)
      (str "\"" s "\"")
      s))
  (defn remove-leading-hyphen [s]
    (if (re-matches #"-.*" s)
      (subs s 1)
      s))
  (defn escape [s] (escape-hyphenated (remove-leading-hyphen s)))
  (string/join " " (map escape (string/split search-string #"\s+"))))