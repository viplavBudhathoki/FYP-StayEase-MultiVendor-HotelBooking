import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Trash2, Send } from "lucide-react";
import { baseUrl } from "../../../constant";
import styles from "./ContactMessages.module.css";

const ContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState({});
  const [replyingId, setReplyingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const token = localStorage.getItem("token");

  const fetchMessages = async () => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("token", token);

      const res = await fetch(`${baseUrl}/contact/getContactMessages.php`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setMessages(Array.isArray(data.data) ? data.data : []);
      } else {
        toast.error(data.message || "Failed to load contact messages");
      }
    } catch (error) {
      toast.error("Failed to load contact messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleReply = async (messageId) => {
    const text = (replyText[messageId] || "").trim();

    if (!text) {
      toast.error("Reply cannot be empty");
      return;
    }

    try {
      setReplyingId(messageId);

      const res = await fetch(`${baseUrl}/contact/adminReplyContactMessage.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          message_id: messageId,
          reply: text,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message || "Reply saved successfully");
        setReplyText((prev) => ({
          ...prev,
          [messageId]: "",
        }));
        await fetchMessages();
        window.dispatchEvent(new Event("messagesUpdated"));
      } else {
        toast.error(data.message || "Failed to save reply");
      }
    } catch (error) {
      toast.error("Failed to save reply");
    } finally {
      setReplyingId(null);
    }
  };

  const handleDelete = async (messageId) => {
    const ok = window.confirm("Remove this message from admin view?");
    if (!ok) return;

    try {
      setDeletingId(messageId);

      const res = await fetch(`${baseUrl}/contact/deleteContactMessage.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          message_id: messageId,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message || "Message removed");
        setMessages((prev) => prev.filter((msg) => msg.message_id !== messageId));
        window.dispatchEvent(new Event("messagesUpdated"));
      } else {
        toast.error(data.message || "Failed to delete message");
      }
    } catch (error) {
      toast.error("Failed to delete message");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDateTime = (value) => {
    if (!value) return "";
    return new Date(value).toLocaleString();
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1>Contact Messages</h1>
          <p>Review, reply to, and manage support messages from customers.</p>
        </div>
      </div>

      {loading ? (
        <div className={styles.stateText}>Loading messages...</div>
      ) : messages.length === 0 ? (
        <div className={styles.stateText}>No contact messages found.</div>
      ) : (
        <div className={styles.messageList}>
          {messages.map((msg) => (
            <div
              key={msg.message_id}
              className={`${styles.card} ${msg.is_read ? styles.read : styles.unread}`}
            >
              <div className={styles.cardHeader}>
                <div className={styles.headerInfo}>
                  <h3 className={styles.subject}>{msg.subject || "No Subject"}</h3>
                  <p className={styles.meta}>
                    From: <strong>{msg.full_name}</strong> ({msg.email})
                  </p>
                  <p className={styles.date}>{formatDateTime(msg.created_at)}</p>
                </div>

                <div className={styles.topRowActions}>
                  {!msg.is_read && <span className={styles.badge}>Unread</span>}
                  {msg.reply && <span className={styles.replied}>Replied</span>}

                  <button
                    type="button"
                    className={styles.deleteMessageBtn}
                    onClick={() => handleDelete(msg.message_id)}
                    disabled={deletingId === msg.message_id}
                  >
                    <Trash2 size={16} />
                    {deletingId === msg.message_id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>

              <div className={styles.messageBlock}>
                <span className={styles.label}>Customer Message</span>
                <p>{msg.message}</p>
              </div>

              {msg.reply ? (
                <div className={styles.replyBlock}>
                  <span className={styles.label}>Admin Reply</span>
                  <p>{msg.reply}</p>

                  {msg.replied_at && (
                    <small className={styles.replyDate}>
                      Replied: {formatDateTime(msg.replied_at)}
                    </small>
                  )}
                </div>
              ) : (
                <div className={styles.replyForm}>
                  <label className={styles.replyLabel}>Reply to Customer</label>

                  <textarea
                    className={styles.textarea}
                    rows="4"
                    placeholder="Write your reply..."
                    value={replyText[msg.message_id] || ""}
                    onChange={(e) =>
                      setReplyText((prev) => ({
                        ...prev,
                        [msg.message_id]: e.target.value,
                      }))
                    }
                  />

                  <button
                    type="button"
                    className={styles.sendBtn}
                    onClick={() => handleReply(msg.message_id)}
                    disabled={replyingId === msg.message_id}
                  >
                    <Send size={16} />
                    {replyingId === msg.message_id ? "Sending..." : "Send Reply"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContactMessages;