(ns Taxi.location-management
  (:require [appengine-magic.services.datastore :as ds]))

(ds/defentity Loc [^{:tag :key} id, owner, ^{:tag :clj} fields])
            
(defn save-location! 
  ([user fields]
    (save-location! nil user fields))
  ([id user fields]
    (let [r (ds/save! (Loc. id user fields))] 
      (println "meta: " (meta r) "=> " (.getId (:key (meta r))))
      (assoc r :id (.getId (:key (meta r)))))))

(defn get-location [storeId]
  (when-let [loc (ds/retrieve Loc storeId)]
    (assoc loc :id (.getId (:key (meta loc))))))

;Loads all locations. Retrieves the location field map for all locations
; and then adds in the locationId key value pair for each location.
(defn get-all-locations []
  (map #(assoc % :id (.getId (:key (meta %))))
       (ds/query :kind Loc)))

;Deletes a location by id
(defn delete-location [id current-user-id] 
  (let [location (ds/retrieve Loc id)] 
    (if (= (:owner location) current-user-id)      
      (ds/delete! location))))
