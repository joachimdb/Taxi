(ns Taxi.trip-management
  (:require [appengine-magic.services.datastore :as ds]))

(ds/defentity Trip [owner, date, arrivalTime, latFrom, lngFrom, addressFrom, latTo, lngTo, addressTo])

(defn save-trip! 
  ([user date arrivalTime latFrom lngFrom addressFrom latTo lngTo addressTo]
    (save-trip! nil user date arrivalTime latFrom lngFrom addressFrom latTo lngTo addressTo))
  ([id user date arrivalTime latFrom lngFrom addressFrom latTo lngTo addressTo]
    (let [r (ds/save! (Trip. user date arrivalTime latFrom lngFrom addressFrom latTo lngTo addressTo))]
      (assoc r :id (.getId (:key (meta r)))))))
  
(defn delete-trip! [id current-user-id] 
  (let [trip (ds/retrieve Trip id)] 
    (if (= (:owner trip) current-user-id)      
      (ds/delete! trip))))

(defn get-trip [storeId]
  (when-let [trip (ds/retrieve Trip storeId)]
    (assoc trip :id (.getId (:key (meta trip))))))

(defn- check-constraints [constraints trip]
  (every? (fn [[key val]]
            (= (key trip) val))
          constraints))

(defn find-trips [constraints]
  (println "find-trips" constraints)
  (map #(assoc % :id (.getId (:key (meta %))))
       (filter (partial check-constraints constraints)
               (ds/query :kind Trip))))

