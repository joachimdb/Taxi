(defproject Taxi "1.0.0-SNAPSHOT"
 :description "Coordinated Travelling Web App"
  :dependencies [[org.clojure/clojure "1.3.0"] [cheshire "2.2.0"] [compojure "1.0.1"]]
  :dev-dependencies [[appengine-magic "0.4.7"]]
  :aot [Taxi.app_servlet Taxi.core Taxi.persistence]          
  )