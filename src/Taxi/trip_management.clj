(ns Taxi.trip-management
  (:require [appengine-magic.services.datastore :as ds]))

(ds/defentity Trip [^{:tag :key} id, owner, date, arrival-time, lat-from, lng-from, lat-to, lng-to, ^{:tag :clj} fields])
            
(defn save-trip! 
  ([user date arrival-time lat-from lng-from lat-to lng-to fields]
    (save-trip! nil user date arrival-time lat-from lng-from lat-to lng-to fields))
  ([id user date arrival-time lat-from lng-from lat-to lng-to fields]
    (let [r (ds/save! (Trip. id user date arrival-time lat-from lng-from lat-to lng-to fields))] 
      (assoc r :id (.getId (:key (meta r)))))))

(defn delete-trip! [id current-user-id] 
  (let [trip (ds/retrieve Trip id)] 
    (if (= (:owner trip) current-user-id)      
      (ds/delete! trip))))

(defn get-trip [storeId]
  (when-let [trip (ds/retrieve Trip storeId)]
    (assoc trip :id (.getId (:key (meta trip))))))

(defn get-all-trips []
  (map #(assoc % :id (.getId (:key (meta %))))
       (ds/query :kind Trip)))
