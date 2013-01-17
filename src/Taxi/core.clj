(ns Taxi.core
  (:require [appengine-magic.core :as ae]
            [compojure.route :as route]
            [appengine-magic.services.user :as aeu]             
            [appengine-magic.services.channel :as aec] 
            )
  (:use [compojure.core]
        ;; [noir.core]
        [cheshire.core :as json] 
        [ring.util.response :as ring-response]
        [compojure.handler :as comp-handler]
        [Taxi.usr-management :as user]
        [Taxi.trip-management :as trip]))

;; 
(ae/stop)

(defn trip-to-message [trip]
  {:msg-id (:trip-id trip)
   :content
   (str "&mode=" (:mode trip)
        "&owner=" (:owner trip)
        "&date=" (:date trip)
        "&arrivalTime=" (:arrivalTime trip)
        "&latFrom=" (:latFrom trip)
        "&lngFrom=" (:lngFrom trip)
        "&addressFrom=" (:addressFrom trip)
        "&latTo=" (:latTo trip)
        "&lngTo=" (:lngTo trip)
        "&addressTo=" (:addressTo trip))})

(defn json-response [data & [status]]
  {:status (or status 200)
   :headers {"Content-Type" "application/json"}
   :body (json/generate-string data)})

(defn require-login [application] 
  (fn [request] 
    (if-let [current-user-id (user/current-user-id)] 
      (do
        (println "checking if user " current-user-id " exists")
        (if-not (user/get-user current-user-id)    
          (user/save-user!)
          (user/update-user current-user-id))
        (application request))
      (ring-response/redirect (aeu/login-url)))))


(defonce +channel-tokens+ (atom {}))
(defn get-channel-token []
  (let [current-user (user/current-user-id),
        current-token (get @+channel-tokens+ (user/current-user-id))]
    (if current-token
      current-token
      (let [new-token (aec/create-channel (user/current-user-id))]
        (reset! +channel-tokens+
                (assoc @+channel-tokens+ (user/current-user-id) new-token))
        new-token))))


(def +channel-tokens+ (atom {}))
(defn get-channel-token []
  (let [current-user (user/current-user-id),
        current-token (get @+channel-tokens+ (user/current-user-id))]
    (if current-token
      current-token
      (let [new-token (aec/create-channel (user/current-user-id))]
        (reset! +channel-tokens+
                (assoc @+channel-tokens+ (user/current-user-id) new-token))
        new-token))))

(defroutes taxi-main-handler
  (GET "/" [location-hint] 
       (println location-hint)
       (ring-response/redirect "/index.html"))
  
  (GET "/users" []
       (json-response (user/get-all-users)))
  
  (POST "/new_trip" {params :params}
        (let [id (try (Integer/parseInt (:tripId params))
                   (catch Exception e nil))
              trip (trip/save-trip! id 
                                    (:mode params) 
                                    (user/current-user-id)
                                    (:tripDate params) 
                                    (:tripTime params)
                                    (Float/parseFloat (:latFrom params))
                                    (Float/parseFloat (:lngFrom params))
                                    (:addressFrom params)
                                    (Float/parseFloat (:latTo params))
                                    (Float/parseFloat (:lngTo params))
                                    (:addressTo params))
              possible-matches (trip/find-matches trip)]
          (println "New trip: " trip)
          (println "Matches: " (trip/find-matches trip))
          (dorun (map (fn [match]
                        (user/send-message (:owner trip) 
                                           (trip-to-message match))
                        (user/send-message (:owner match) (trip-to-message trip)))
                      possible-matches))
          (json-response trip)))
  
  (GET "/trip:id" [id]
       (if-let [id-string (re-matches #":[0-9]+" id)]
         (json-response (trip/get-trip (user/current-user-id) (Integer/parseInt (apply str (drop 1 id-string)))))))
  
  (GET "/trips" []
       ;; note: can probably be done directly (and more efficiently) with ds/query
       (json-response (trip/find-trips {:owner (user/current-user-id)})))
  
  (POST "/get_channel_token" {params :params}
       (let [token (get-channel-token)]
         (println "token: " token)
         (json-response token)
         ))
  
  (POST "/pong" {params :params}
       (println "received pong: " params)
       (user/confirm-received (current-user-id) (:msg-id params))
       (json-response nil))
  
  (POST "/_ah/channel/connected" {params :params}
        (println "post " params " on /_ah/channel/connected")
        (json-response params))
  
  (POST "/_ah/channel/disconnected" {params :params}
        (println "post " params " on _ah/channel/disconnected")
        (json-response params))
  
  (route/resources "/")
  (route/not-found "Page not found"))

(def app (require-login (comp-handler/api taxi-main-handler)))
(ae/def-appengine-app taxi-app (var app))

;; 
(ae/serve taxi-app)

