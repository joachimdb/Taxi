(ns Taxi.persistence
  (:require [appengine-magic.services.datastore :as ds]
            [appengine-magic.services.user :as aeu]))

(ds/defentity Loc [#^:key storeId, user, #^:clj location-fields])
               
; Save a location. -1 is used to signify no id passed in and nil
; should be substitued
(defn save-location [user locationFields] 
  (let [input-id (Integer/parseInt (:locationId locationFields))
        id (if (= input-id -1) nil input-id)]
    (let [return-val (ds/save! (Loc. id user locationFields))]
      (assoc return-val :storeId (.getId (:key (meta return-val)))))))

(defn get-location [storeId]
  (if-let [loc (ds/retrieve Loc storeId)]
    (assoc (:locationFields loc) :locationId storeId)))

;Loads all locations. Retrieves the location field map for all locations
; and then adds in the locationId key value pair for each location.
(defn get-all-locations [] 
  (map 
   (fn [k]
     (println k)
     (assoc (:locationFields k) :locationId (ds/key-id k))) ;This line sets the id onto the map at load time 
   ;;(ds/query :kind Location :filter (= :user user))
   (ds/query :kind Loc)))

;Gets a map of locations keyed by the locationId value
(defn get-all-locations-map []
  (let [loaded-locations  
        (map 
          (fn [k] 
            (assoc (:locationFields k) :locationId (ds/key-id k)));This line sets the id onto the map at load time 
          ;;(ds/query :kind Location :filter (= :user user))
          (ds/query :kind Loc))]
    (zipmap (map (fn [k] (:locationId k)) loaded-locations) loaded-locations)))
 
;Deletes a location by locationId
(defn delete-location [user locationId] 
  (let [location (ds/retrieve Loc locationId)] 
    (if (= (:user location) user)      
      (ds/delete! location))))

;; (defn save-task [user task-map] 
;;   (let [input-id (Integer/parseInt (:taskId task-map))
;;         id (if (= input-id -1) nil input-id)
;;         locationId (:locationId task-map)]
;;     (ds/save! (Task. id user locationId "false" task-map))))

;; (defn complete-task [user taskId] 
;;   (let [task (ds/retrieve Task taskId)] 
;;     (if (= (:user task) user) 
;;       (ds/save! (assoc task :complete "true")))))
                                    

;; (defn get-all-tasks [user] 
;;   (let [locations 
;;         (get-all-locations-map user)]
;;     (map 
;;       (fn [k] 
;;         (let [task-map (:task k)
;;               taskLocationId (:taskLocationId task-map)
;;               location  (if (= nil taskLocationId) nil (get locations (Integer/parseInt taskLocationId)))] 
;;           (if (= location nil)
;;             task-map 
;;             (assoc 
;;               task-map 
;;               :taskId (ds/key-id k) 
;;               :taskLat (:locationLat location)
;;               :taskLng (:locationLng location)))))
;;       (ds/query :kind Task :filter  [(= :user user) (= :complete "false")]))))


(ds/defentity User [^:key email, nickname])

(defn current-user []
  (let [u (aeu/current-user)]
    (User. (.getEmail u) (.getNickname u))))

(defn save-user! [user] 
;;  (ds/save! user))
  (let [return-val (ds/save! user)]
    (assoc return-val :storeId (.getId (:key (meta return-val))))))

(defn new-user! [email nick]
  (save-user! (User. email nick)))

(defn get-user [storeId]
  (ds/retrieve User storeId))

(defn get-all-users []
  (ds/query :kind User))
