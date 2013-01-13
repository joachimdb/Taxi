(ns Taxi.core
  (:require [appengine-magic.core :as ae]
            [compojure.route :as route]
            [appengine-magic.services.user :as aeu]             
            )
  (:use [compojure.core]
        ;; [noir.core]
        [cheshire.core :as json] 
        [ring.util.response :as ring-response]
        [compojure.handler :as comp-handler]
        [Taxi.usr-management :as user]
        [Taxi.location-management :as loc]
        [Taxi.trip-management :as trip]))

(ae/stop)

(defn json-response [data & [status]]
  {:status (or status 200)
   :headers {"Content-Type" "application/json"}
   :body (json/generate-string data)})

(defn require-login [application] 
  (fn [request] 
    (if-let [current-user-id (user/current-user-id)] 
      (do
        (println "checking if user " current-user-id " exists")
        (when-not (user/get-user current-user-id)
          (println "new-user!")
          (user/save-user! current-user-id))
        (application request))
      (ring-response/redirect (aeu/login-url)))))

(defroutes taxi-main-handler
  (GET "/" [location-hint] 
       (println location-hint)
       (ring-response/redirect "/index.html"))
  
  (GET "/users" []
       (json-response (user/get-all-users)))
  
  (POST "/new-location" {params :params}
        (println "save-location: " params)
        (println "id: " (:id params)) 
        (let [id (try (Integer/parseInt(:id params))
                   (catch Exception e nil))
              response (loc/save-location! id 
                                           (user/current-user-id)
                                           (dissoc params :id))]
          (println "resp: " response)
          (json-response response)))
  
  (POST "/new-trip" {params :params}
        (println "save-trip: " params)
        (let [id (try (Integer/parseInt (:id params))
                   (catch Exception e nil))
              response (trip/save-trip! id 
                                        (user/current-user-id)
                                        (:trip_date params) 
                                        (:trip-time params)
                                        (Float/parseFloat (:Lat_from params))
                                        (Float/parseFloat (:Lng_from params))
                                        (Float/parseFloat (:Lat_to params))
                                        (Float/parseFloat (:Lng_to params))
                                        (dissoc params :id :trip_date :trip-time :Lat-from :Lng-from :Lat-to :Lng-to))]
          (println "resp: " response)
          (json-response response)))

  (GET "/get-location:id" [id]
        (if-let [id-string (re-matches #":[0-9]+" id)]
           (json-response (loc/get-location (Integer/parseInt (apply str (drop 1 id-string)))))))
  
  (POST "/delete-location" {params :params} 
        (println "delete-location: " params)
        (json-response (loc/delete-location (Integer/parseInt (:id params))
                                            (user/current-user-id))))
  
  (GET "/locations" []
       (json-response (loc/get-all-locations)))
  
  (route/resources "/")
  (route/not-found "Page not found"))


(def app (require-login (comp-handler/api taxi-main-handler)))
(ae/def-appengine-app taxi-app (var app))

(ae/serve taxi-app)

