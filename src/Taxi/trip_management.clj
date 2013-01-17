(ns Taxi.trip-management
  (:require [appengine-magic.services.datastore :as ds]))

(ds/defentity Trip [^:key trip-id, mode, owner, date, arrivalTime, latFrom, lngFrom, addressFrom, latTo, lngTo, addressTo])

(defn save-trip! 
  ([mode user date arrivalTime latFrom lngFrom addressFrom latTo lngTo addressTo]
    (save-trip! nil mode user date arrivalTime latFrom lngFrom addressFrom latTo lngTo addressTo))
  ([trip-id mode user date arrivalTime latFrom lngFrom addressFrom latTo lngTo addressTo]
    (let [r (ds/save! (Trip. trip-id mode user date arrivalTime latFrom lngFrom addressFrom latTo lngTo addressTo))]
      (assoc r :trip-id (.getId (:key (meta r)))))))
  
(defn delete-trip! [trip-id current-user-id] 
  (let [trip (ds/retrieve Trip trip-id)] 
    (if (= (:owner trip) current-user-id)      
      (ds/delete! trip))))

(defn get-trip [user-id storeId]
  (when-let [trip (ds/retrieve Trip storeId)]
    (when (= (:owner trip) user-id)
      (assoc trip :trip-id (.getId (:key (meta trip)))))))

(defn- check-constraints [constraints trip]
  (every? (fn [[key val]]
            (= (key trip) val))
          constraints))

(defn find-trips [constraints]
  (println "find-trips" constraints)
  (map #(assoc % :trip-id (.getId (:key (meta %))))
       (filter (partial check-constraints constraints)
               (ds/query :kind Trip))))

(defn find-matches [for-trip]
  (println "mode: " (:mode for-trip))
  (let [req-mode (if (= "offering" (:mode for-trip)) "searching" "offering")]
    (map #(assoc % :trip-id (.getId (:key (meta %))))
         (ds/query :kind Trip :filter (= :mode req-mode)))))

;(def tmp (com.google.appengine.api.datastore.DatastoreApiHelper.)
;(com.google.appengine.api.datastore.DatastoreApiHelper.getCurrentAppId)