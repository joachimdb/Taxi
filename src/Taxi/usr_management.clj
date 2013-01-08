(ns Taxi.usr-management
  (:require [appengine-magic.services.user :as aeu]
            [appengine-magic.services.datastore :as ds]))

(ds/defentity User [^{:tag :key} id, ^{:tag :clj} fields])

(defn current-user-id []
  (when (aeu/user-logged-in?)
    (aeu/get-email (aeu/current-user))))

(defn current-user-nickname []
  (when (aeu/user-logged-in?)
    (aeu/get-nickname (aeu/current-user))))

(defn save-user! 
  ([] (if-let [current-user (aeu/current-user)]
        (save-user! (aeu/get-email current-user)
                   {:nickname (aeu/get-nickname current-user)})
        (throw (Exception. "User not logged in."))))
  ([user-id]
    (if-let [current-user (aeu/current-user)]
      (save-user! user-id
                 {:nickname (aeu/get-nickname current-user)})
      (throw (Exception. "User not logged in."))))
  ([email fields]
    (ds/save! (User. email fields))))

(defn get-user [storeId]
  (ds/retrieve User storeId))
    
(defn get-all-users []
  (ds/query :kind User))
