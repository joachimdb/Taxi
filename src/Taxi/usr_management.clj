
(ns Taxi.usr-management
  (:require [appengine-magic.services.user :as aeu]
            [appengine-magic.services.datastore :as ds]
            [appengine-magic.services.channel :as aec]))

(ds/defentity User [^:key email, nickname, last-updated, ^:clj pending])

(defn current-user-id []
  (when (aeu/user-logged-in?)
    (aeu/get-email (aeu/current-user))))

(defn current-user-nickname []
  (when (aeu/user-logged-in?)
    (aeu/get-nickname (aeu/current-user))))

(defn save-user! 
  ([] (save-user! (current-user-id)
                  (current-user-nickname)))
  ([user] (ds/save! user))
  ([email nickname]
    (ds/save! (User. email nickname (java.util.Date.) {}))))

(defn get-user [email]
  (ds/retrieve User email))
    
(defn get-all-users []
  (ds/query :kind User))

(defn send-message [user-id message]
  ;; (1) message is added to the datastore
  ;; (2) the message is sent with a ping and a :msg-id = (key message) tag added to it
  ;; (3) Later, when the client answers with a pong and the same message id, the message 
  ;;     is deleted through a call to confirm-received
  (let [usr (get-user user-id)
        msg-id (str (:msgId message))
        content (:content message)]
    (println (.toString (java.util.Date.))
             " Sending msg " msg-id " to " user-id)
    (save-user! (assoc-in usr [:pending msg-id] 
                          (:content message)))
    (aec/send user-id (str "&msgId=" msg-id (:content message)))))
  
(defn confirm-received [user-id msg-id]
  (println (.toString (java.util.Date.))
           " Confirmation for " msg-id " from " user-id)
  (let [usr (get-user user-id)]
    (save-user! (assoc usr 
                       :pending (dissoc (:pending usr) msg-id)))))

(defn update-user [usr]
  ;; send all messaged not received yet
  (let [user-id (:email usr)]
    (dorun (map (fn [[msg-id content]] 
                  (println (.toString (java.util.Date.))
                           " Resending message " msg-id " to " user-id)
                  (aec/send user-id (str "&msgId=" msg-id content))
                  )
                (:pending (get-user user-id))))
    (save-user! (assoc usr :last-updated (java.util.Date.)))))
