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
        [Taxi.persistence :as persist]))

(defn json-response [data & [status]]
  {:status (or status 200)
   :headers {"Content-Type" "application/json"}
   :body (json/generate-string data)})

(defn require-login [application] 
  (fn [request] 
    (if 
      (aeu/user-logged-in?)  
      (application request)
      (ring-response/redirect 
        (aeu/login-url))
      )))

(defn getEmail [] 
  (.getEmail (aeu/current-user)))

(defroutes taxi-main-handler
           (GET "/" [] (ring-response/redirect "/index.html"))

           (GET "/location:id" [id]
                (if-let [id-string (re-matches #":[0-9]+" id)]
                  (json-response (persist/get-location (Integer/parseInt (apply str (drop 1 id-string)))))))
           
           
           (GET "/locations" []
                (json-response {:locations (persist/get-all-locations)}))

           (POST "/delete-location" {params :params} 
                 (json-response (persist/delete-location (getEmail) (Integer/parseInt (:locationId params)))))

           ;; Update Location Route                                 
           (POST "/location" {params :params}
                 (println)
                 (println params)
                 (let [response (persist/save-location (getEmail) params)]
                   (println response)
                   (println (json-response response))
                   (json-response response)))

           
           ;; (GET "/tasks" []
           ;;      (json-response {:tasks (get-all-tasks (getEmail))}))           
           
           ;; (POST "/task" {params :params} 
           ;;       (json-response {:taskId (persist/save-task (getEmail) params)}))                         
           
           ;; (POST "/complete-task" {params :params} 
           ;;       (json-response {:taskId (persist/complete-task (getEmail) (Integer/parseInt (:taskId params)))}))

           ;Static Resources           
           (route/resources "/")
           (route/not-found "Page not found"))


(def app (require-login (comp-handler/api taxi-main-handler)))
(ae/def-appengine-app taxi-app (var app))

(comment
  (ae/serve taxi-app)
  (ae/stop)
  )