(ns helsinki-info.search-utils
  (:require [clojure.string :as string]))

(defn escapeSearchString [searchString]

  (defn escapeHyphenated [s]
    (if (re-matches #".(.*)-(.*)." s)
      (str "\"" s "\"")
      s))

  (defn removeLeadingHyphen [s]
    (if (re-matches #"-.*" s)
      (subs s 1)
      s))

  (defn escape [s] (escapeHyphenated (removeLeadingHyphen s)))
  (string/join " " (map escape (string/split searchString #"\s+"))))