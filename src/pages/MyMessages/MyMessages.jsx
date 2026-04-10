import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { MessageSquareText, Send, Mail, Plus, Trash2 } from "lucide-react";
import { baseUrl } from "../../constant";
import styles from "./MyMessages.module.css";

const MyMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState({});
  const [sendingId, setSendingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showNewMessageForm, setShowNewMessageForm] = useState(false);
  const [newMessageSending, setNewMessageSending] = useState(false);

  const [newMessageForm, setNewMessageForm] = useState({
    subject: "",
    message: "",
  });

  const token = localStorage.getItem("token");

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

  const fetchMessages = useCallback(async () => {
    if (!token) {
      setMessages([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("token", token);

      const res = await fetch(`${baseUrl}/contact/getMyContactMessages.php`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        const incoming = Array.isArray(data.data) ? data.data : [];
        setMessages(incoming);

        // Mark replied messages as read for customer
        const unreadReplyMessages = incoming.filter(
          (msg) => msg.reply && Number(msg.user_read) === 0
        );

        if (unreadReplyMessages.length > 0) {
          await Promise.all(
            unreadReplyMessages.map((msg) =>
              fetch(`${baseUrl}/contact/markUserMessageRead.php`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  token,
                  message_id: msg.message_id,
                }),
              }).catch(() => null)
            )
          );

          window.dispatchEvent(new Event("messagesUpdated"));
        }
      } else {
        toast.error(data.message || "Failed to load messages");
        setMessages([]);
      }
    } catch (error) {
      toast.error("Failed to load messages");
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const formatDate = (value) => {
    if (!value) return "";
    const d = new Date(value);

    return d.toLocaleString([], {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleReply = async (messageId, subject) => {
    const text = (replyText[messageId] || "").trim();

    if (!text) {
      toast.error("Reply cannot be empty");
      return;
    }

    try {
      setSendingId(messageId);

      const res = await fetch(`${baseUrl}/contact/replyToContactMessage.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          subject,
          message: text,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message || "Reply sent successfully");
        setReplyText((prev) => ({
          ...prev,
          [messageId]: "",
        }));
        fetchMessages();
        window.dispatchEvent(new Event("messagesUpdated"));
      } else {
        toast.error(data.message || "Failed to send reply");
      }
    } catch (error) {
      toast.error("Failed to send reply");
    } finally {
      setSendingId(null);
    }
  };

  const handleNewMessageSubmit = async (e) => {
    e.preventDefault();

    if (!token || !user) {
      toast.error("Please log in to send a message");
      return;
    }

    const subject = newMessageForm.subject.trim();
    const message = newMessageForm.message.trim();

    if (!message) {
      toast.error("Message is required");
      return;
    }

    try {
      setNewMessageSending(true);

      const res = await fetch(`${baseUrl}/contact/addContactMessage.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          full_name: user.full_name || "",
          email: user.email || "",
          subject,
          message,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message || "Message sent successfully");
        setNewMessageForm({
          subject: "",
          message: "",
        });
        setShowNewMessageForm(false);
        fetchMessages();
        window.dispatchEvent(new Event("messagesUpdated"));
      } else {
        toast.error(data.message || "Failed to send message");
      }
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setNewMessageSending(false);
    }
  };

  const handleDelete = async (messageId) => {
    const ok = window.confirm("Remove this message from your inbox?");
    if (!ok) return;

    try {
      setDeletingId(messageId);

      const res = await fetch(`${baseUrl}/contact/deleteMyContactMessage.php`, {
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

  if (loading) {
    return <div className={styles.stateText}>Loading messages...</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <div>
            <h1>My Messages</h1>
            <p>View your support messages and continue the conversation with admin.</p>
          </div>

          <button
            type="button"
            className={styles.newMessageBtn}
            onClick={() => setShowNewMessageForm((prev) => !prev)}
          >
            <Plus size={16} />
            {showNewMessageForm ? "Close" : "New Message"}
          </button>
        </div>

        {showNewMessageForm && (
          <form className={styles.newMessageCard} onSubmit={handleNewMessageSubmit}>
            <h3>Start New Support Message</h3>

            <div className={styles.formGroup}>
              <label>Subject</label>
              <input
                type="text"
                placeholder="Enter subject"
                value={newMessageForm.subject}
                onChange={(e) =>
                  setNewMessageForm((prev) => ({
                    ...prev,
                    subject: e.target.value,
                  }))
                }
              />
            </div>

            <div className={styles.formGroup}>
              <label>Message</label>
              <textarea
                rows="5"
                placeholder="Write your message..."
                value={newMessageForm.message}
                onChange={(e) =>
                  setNewMessageForm((prev) => ({
                    ...prev,
                    message: e.target.value,
                  }))
                }
              />
            </div>

            <div className={styles.newMessageActions}>
              <button
                type="submit"
                className={styles.sendBtn}
                disabled={newMessageSending}
              >
                <Send size={16} />
                {newMessageSending ? "Sending..." : "Send Message"}
              </button>
            </div>
          </form>
        )}

        {messages.length === 0 ? (
          <div className={styles.emptyState}>
            <MessageSquareText size={32} />
            <h3>No messages yet</h3>
            <p>Your support conversations will appear here.</p>

            {!showNewMessageForm && (
              <button
                type="button"
                className={styles.startMessageBtn}
                onClick={() => setShowNewMessageForm(true)}
              >
                <Plus size={16} />
                Start New Message
              </button>
            )}
          </div>
        ) : (
          <div className={styles.list}>
            {messages.map((msg) => (
              <div key={msg.message_id} className={styles.card}>
                <div className={styles.topRow}>
                  <div>
                    <h3>{msg.subject || "No Subject"}</h3>
                    <p className={styles.date}>
                      Sent: {formatDate(msg.created_at)}
                    </p>
                  </div>

                  <div className={styles.topRowActions}>
                    {msg.reply ? (
                      <span className={styles.repliedBadge}>Replied</span>
                    ) : (
                      <span className={styles.pendingBadge}>Waiting</span>
                    )}

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
                  <span className={styles.label}>Your Message</span>
                  <p>{msg.message}</p>
                </div>

                {msg.reply ? (
                  <div className={styles.replyBlock}>
                    <span className={styles.label}>Admin Reply</span>
                    <p>{msg.reply}</p>
                    {msg.replied_at && (
                      <small className={styles.replyDate}>
                        Replied: {formatDate(msg.replied_at)}
                      </small>
                    )}
                  </div>
                ) : (
                  <div className={styles.noReplyBlock}>
                    <Mail size={16} />
                    <span>No reply from admin yet.</span>
                  </div>
                )}

                <div className={styles.followUpBox}>
                  <label className={styles.followUpLabel}>Send Follow-up</label>
                  <textarea
                    className={styles.textarea}
                    rows="4"
                    placeholder="Write your follow-up message..."
                    value={replyText[msg.message_id] || ""}
                    onChange={(e) =>
                      setReplyText((prev) => ({
                        ...prev,
                        [msg.message_id]: e.target.value,
                      }))
                    }
                  />

                  <div className={styles.actions}>
                    <button
                      type="button"
                      className={styles.sendBtn}
                      onClick={() => handleReply(msg.message_id, msg.subject || "")}
                      disabled={sendingId === msg.message_id}
                    >
                      <Send size={16} />
                      {sendingId === msg.message_id ? "Sending..." : "Send Reply"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyMessages;