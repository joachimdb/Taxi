(ns Taxi.core
  (:require [appengine-magic.core :as ae]
            [compojure.route :as route]
            [appengine-magic.services.user :as aeu]             
            [appengine-magic.services.channel :as aec] 
            )
  (:use [compojure.core]
        ;; [noir.core]
        [cheshire.core :as json] 
        [cheshire.generate :as json-gen :only [add-encoder encode-map]]
        [ring.util.response :as ring-response]
        [compojure.handler :as comp-handler]
        [Taxi.usr-management :as user]
        [Taxi.trip-management :as trip])
  (:import java.text.SimpleDateFormat
           com.google.appengine.api.datastore.GeoPt))

;; 
(ae/stop)

(json-gen/add-encoder com.google.appengine.api.datastore.GeoPt
                      (fn [geoPt jsonGenerator]
                        (json-gen/encode-map {:latitude (.getLatitude geoPt),
                                              :longitude (.getLongitude geoPt)}
                                             jsonGenerator)))

(defn json-response [data & [status]]
  {:status (or status 200)
   :headers {"Content-Type" "application/json"}
   :body (json/generate-string data)})

(defn require-login [application] 
  (fn [request] 
    (if-let [current-user-id (user/current-user-id)] 
      (do
        (if-let [usr (user/get-user current-user-id)]
          (when (> (- (.getTime (java.util.Date.))
                      (.getTime (:last-updated usr)))
                   60000)
            (println (.toString (java.util.Date.))
                     " Updating user" (user/current-user-id) " (elapsed time since last update: " 
                     (- (.getTime (java.util.Date.))
                        (.getTime (:last-updated usr)))
                     ")")
            (user/update-user usr))
          (do (println (.toString (java.util.Date.))
                     " Adding user " (user/current-user-id))
            (user/save-user!)))
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
  (let [current-user-id (user/current-user-id),
        current-token (get @+channel-tokens+ current-user-id)]
    (if current-token
      current-token
      (let [new-token (aec/create-channel current-user-id)]
        (reset! +channel-tokens+
                (assoc @+channel-tokens+ current-user-id new-token))
        new-token))))

(defroutes taxi-main-handler
  (GET "/" [] 
       (ring-response/redirect "/index.html"))
  
  (GET "/users" []
       (json-response (user/get-all-users)))
  
  (POST "/new_trip" {params :params}
        (let [id (try (Integer/parseInt (:tripId params))
                   (catch Exception e nil))
              arrival-date (.parse (java.text.SimpleDateFormat. "dd/MM/yyyy hh:mm")
                             (str (:tripDate params) " " (:tripTime params)))
              start-location (GeoPt. (Float/parseFloat (:latFrom params))
                                     (Float/parseFloat (:lngFrom params)))
              destination (GeoPt. (Float/parseFloat (:latTo params))
                                  (Float/parseFloat (:lngTo params)))
              trip (trip/save-trip! id 
                                    (:mode params) 
                                    (user/current-user-id)
                                    arrival-date
                                    start-location
                                    (:addressFrom params)
                                    destination
                                    (:addressTo params))
              possible-matches (trip/find-matches trip)]
          (println (.toString (.toString (java.util.Date.)))
                   " New trip: " trip)
          (dorun (map (fn [match]
                        (user/send-message (:owner trip) 
                                           (trip/encode-trip match))
                        (user/send-message (:owner match) (trip/encode-trip trip)))
                      possible-matches))
          (json-response trip)))
  
  (GET "/trip:id" [id]
       (if-let [id-string (re-matches #":[0-9]+" id)]
         (json-response (trip/get-trip (user/current-user-id) (Integer/parseInt (apply str (drop 1 id-string)))))))
  
  (GET "/trips" []
       ;; note: can probably be done directly (and more efficiently) with ds/query
       (json-response (trip/find-trips {:owner (user/current-user-id)})))
  
  (POST "/get_channel_token" {params :params}
        (json-response (get-channel-token)))
  
  (GET "/token_received" []
       (user/update-user (user/get-user (user/current-user-id)))
       (json-response "OK"))
  
  (POST "/confirm" {params :params}
       (user/confirm-received (current-user-id) (:msgId params))
       (json-response nil))
  
  (route/resources "/")
  (route/not-found "Page not found"))

(def app (require-login (comp-handler/api taxi-main-handler)))
(ae/def-appengine-app taxi-app (var app))

;; 
(ae/serve taxi-app)

