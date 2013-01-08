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
        [Taxi.usr-management :as user]))

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
          (user/new-user! current-user-id))
        (application request))
      (ring-response/redirect (aeu/login-url)))))

(defn getEmail [] 
  (.getEmail (aeu/current-user)))

(defroutes taxi-main-handler
  (GET "/" [] (ring-response/redirect "/index.html"))
  
;  (GET "/user:email" [email]
;       (json-response (user/get-user email)))
  
  (GET "/users" []
       (json-response (user/get-all-users)))
  
  (route/resources "/")
  (route/not-found "Page not found"))


(def app (require-login (comp-handler/api taxi-main-handler)))
(ae/def-appengine-app taxi-app (var app))

(ae/serve taxi-app)

(comment
  (ae/serve taxi-app)
  (ae/stop)
  )