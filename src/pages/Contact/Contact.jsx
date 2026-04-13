import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { baseUrl } from "../../constant";
import styles from "./Contact.module.css";

const Contact = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      toast.error("Please log in to send a message");
      navigate("/login", { state: { from: "/contact" } });
      return;
    }

    if (!form.full_name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const res = await fetch(`${baseUrl}/contact/addContactMessage.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          ...form,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message || "Your message has been submitted");
        setForm({
          full_name: "",
          email: "",
          subject: "",
          message: "",
        });
      } else {
        toast.error(data.message || "Failed to send message");
      }
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  return (
    <div className={styles.contactPage}>
      <section className={styles.heroSection}>
        <div className={styles.container}>
          <span className={styles.badge}>Contact Us</span>
          <h1 className={styles.heroTitle}>We’d love to hear from you</h1>
          <p className={styles.heroText}>
            Whether you have questions about bookings, hotel listings, or support,
            our team is here to help you with the StayEase experience.
          </p>
        </div>
      </section>

      <section className={styles.contactSection}>
        <div className={styles.container}>
          <div className={styles.contactGrid}>
            <div className={styles.infoPanel}>
              <h2>Get in touch</h2>
              <p>
                Reach out to us through the contact details below or send us a
                message directly using the form.
              </p>

              <div className={styles.infoList}>
                <div className={styles.infoItem}>
                  <div className={styles.iconBox}>
                    <Mail size={20} />
                  </div>
                  <div>
                    <h4>Email</h4>
                    <p>support@stayease.com</p>
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <div className={styles.iconBox}>
                    <Phone size={20} />
                  </div>
                  <div>
                    <h4>Phone</h4>
                    <p>9800000000</p>
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <div className={styles.iconBox}>
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h4>Location</h4>
                    <p>Pokhara, Nepal</p>
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <div className={styles.iconBox}>
                    <Clock size={20} />
                  </div>
                  <div>
                    <h4>Working Hours</h4>
                    <p>Sunday - Friday, 9:00 AM - 6:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            <form className={styles.formPanel} onSubmit={handleSubmit}>
              <h2>Send a message</h2>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={form.full_name}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, full_name: e.target.value }))
                    }
                    placeholder="Enter your full name"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Subject</label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, subject: e.target.value }))
                  }
                  placeholder="Enter subject"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Message</label>
                <textarea
                  rows="6"
                  value={form.message}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, message: e.target.value }))
                  }
                  placeholder="Write your message here..."
                />
              </div>

              <button type="submit" className={styles.submitBtn}>
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;