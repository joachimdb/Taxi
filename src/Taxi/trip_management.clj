(ns Taxi.trip-management
  (:require [appengine-magic.services.datastore :as ds]
            )
  (:import java.text.SimpleDateFormat
           com.google.appengine.api.datastore.GeoPt))

(ds/defentity Trip [^:key tripId, mode, owner, arrivalDate, geoPtFrom, addressFrom, geoPtTo, addressTo])

(defn encode-trip [trip]
  {:msgId (:tripId trip)
   :content
   (str "&mode=" (:mode trip)
        "&owner=" (:owner trip)
        "&arrivalDate=" (.format (java.text.SimpleDateFormat. "dd/MM/yyyy hh:mm") (:arrivalDate trip))
        "&latFrom=" (.getLatitude (:geoPtFrom trip))
        "&lngFrom=" (.getLongitude (:geoPtFrom trip))
        "&addressFrom=" (:addressFrom trip)
        "&latFrom=" (.getLatitude (:geoPtTo trip))
        "&lngFrom=" (.getLongitude (:geoPtTo trip))
        "&addressTo=" (:addressTo trip))})

(defn save-trip! 
  ([mode user arrivalDate geoPtFrom addressFrom geoPtTo addressTo]
    (save-trip! nil mode user arrivalDate geoPtFrom addressFrom geoPtTo addressTo))
  ([trip-id mode user arrivalDate geoPtFrom addressFrom geoPtTo addressTo]
    (let [r (ds/save! (Trip. trip-id mode user arrivalDate geoPtFrom addressFrom geoPtTo addressTo))]
      (assoc r :tripId (.getId (:key (meta r)))))))
  
(defn delete-trip! [trip-id current-user-id] 
  (let [trip (ds/retrieve Trip trip-id)] 
    (if (= (:owner trip) current-user-id)      
      (ds/delete! trip))))

(defn get-trip [user-id storeId]
  (when-let [trip (ds/retrieve Trip storeId)]
    (when (= (:owner trip) user-id)
      (assoc trip :tripId (.getId (:key (meta trip)))))))

(defn- check-constraints [constraints trip]
  (every? (fn [[key val]]
            (= (key trip) val))
          constraints))

(defn find-trips [constraints]
  (map #(assoc % :tripId (.getId (:key (meta %))))
       (filter (partial check-constraints constraints)
               (ds/query :kind Trip))))

(defn find-matches [for-trip]
  (let [req-mode (if (= "offering" (:mode for-trip)) "searching" "offering")]
    (map #(assoc % :tripId (.getId (:key (meta %))))
         (ds/query :kind Trip :filter [(= :mode req-mode)
                                       (!= :owner (:owner for-trip))]))))

;(def tmp (com.google.appengine.api.datastore.DatastoreApiHelper.)
;(com.google.appengine.api.datastore.DatastoreApiHelper.getCurrentAppId)