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
  
  (POST "/new_trip" {params :params}
        (println "save-trip: " params)
        (let [id (try (Integer/parseInt (:tripId params))
                   (catch Exception e nil))
              response (trip/save-trip! id 
                                        (user/current-user-id)
                                        (:tripDate params) 
                                        (:tripTime params)
                                        (Float/parseFloat (:latFrom params))
                                        (Float/parseFloat (:lngFrom params))
                                        (:addressFrom params)
                                        (Float/parseFloat (:latTo params))
                                        (Float/parseFloat (:lngTo params))
                                        (:addressTo params))]
          (println "resp: " response)
          (json-response response)))
  
(GET "/trip:id" [id]
        (if-let [id-string (re-matches #":[0-9]+" id)]
           (json-response (trip/get-trip (Integer/parseInt (apply str (drop 1 id-string)))))))
  
(GET "/trips" []
       (json-response (trip/find-trips {:owner (user/current-user-id)})))
  
  (route/resources "/")
  (route/not-found "Page not found"))


(def app (require-login (comp-handler/api taxi-main-handler)))
(ae/def-appengine-app taxi-app (var app))

(ae/serve taxi-app)

