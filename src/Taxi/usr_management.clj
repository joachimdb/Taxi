(ns Taxi.usr-management
  (:require [appengine-magic.services.user :as aeu]
            [appengine-magic.services.datastore :as ds]))

(ds/defentity User [^{:tag :key} email, nickname])

(defn current-user-id []
  (when (aeu/user-logged-in?)
    (aeu/get-email (aeu/current-user))))

(defn current-user-nickname []
  (when (aeu/user-logged-in?)
    (aeu/get-nickname (aeu/current-user))))

(defn new-user! 
  ([] (if-let [current-user (aeu/current-user)]
        (new-user! (aeu/get-email current-user)
                   (aeu/get-nickname current-user))
        (throw (Exception. "User not logged in."))))
  ([user-id]
    (if-let [current-user (aeu/current-user)]
      (new-user! user-id
                 (aeu/get-nickname current-user))
      (throw (Exception. "User not logged in."))))
  ([email nick]
    (ds/save! (User. email nick))))

(defn get-user [storeId]
  (ds/retrieve User storeId))

(defn get-all-users []
  (ds/query :kind User))
