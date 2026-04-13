import { useEffect, useState, useRef, useMemo } from "react";
import toast from "react-hot-toast";
import {
  User,
  Mail,
  Shield,
  Eye,
  EyeOff,
} from "lucide-react";
import styles from "./AdminSettings.module.css";
import { baseUrl } from "../../../constant";

const defaultSettings = {
  platform_name: "StayEase",
  support_email: "",
  support_phone: "",
  default_currency: "Rs.",
  timezone: "Asia/Kathmandu",
  min_booking_nights: 1,
  max_booking_nights: 30,
  default_check_in_time: "14:00",
  default_check_out_time: "12:00",
  free_cancellation_days: 1,
  no_show_charge_type: "one_night",
  cancellation_policy_text: "",
  notify_new_booking: 1,
  notify_booking_cancelled: 1,
  notify_new_review: 1,
  notify_vendor_registration: 1,
};

const defaultAdmin = {
  full_name: "",
  email: "",
  profile_photo: "",
};

const defaultPassword = {
  current_password: "",
  new_password: "",
  confirm_password: "",
};

const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoVersion, setPhotoVersion] = useState(Date.now());

  const [settingsForm, setSettingsForm] = useState(defaultSettings);
  const [adminForm, setAdminForm] = useState(defaultAdmin);
  const [passwordForm, setPasswordForm] = useState(defaultPassword);

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    next: false,
    confirm: false,
  });

  const fileInputRef = useRef(null);
  const token = localStorage.getItem("token");

  const profilePhotoSrc = useMemo(() => {
    if (!adminForm.profile_photo) return "";
    return `${baseUrl}/${adminForm.profile_photo}?t=${photoVersion}`;
  }, [adminForm.profile_photo, photoVersion]);

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const fetchSettings = async () => {
    if (!token) {
      toast.error("Please login again");
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `${baseUrl}/settings/getSystemSettings.php?token=${encodeURIComponent(
          token
        )}`
      );
      const data = await res.json();

      if (data.success) {
        setSettingsForm({
          ...defaultSettings,
          ...(data.data?.settings || {}),
        });

        setAdminForm({
          ...defaultAdmin,
          ...(data.data?.admin || {}),
        });

        let storedUser = null;
        try {
          storedUser = JSON.parse(localStorage.getItem("user"));
        } catch {
          storedUser = null;
        }

        if (storedUser?.profile_photo && !data.data?.admin?.profile_photo) {
          setAdminForm((prev) => ({
            ...prev,
            profile_photo: storedUser.profile_photo,
          }));
        }
      } else {
        toast.error(data.message || "Failed to load settings");
      }
    } catch {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [token]);

  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;

    setSettingsForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    }));
  };

  const handleAdminChange = (e) => {
    const { name, value } = e.target;

    setAdminForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const openPhotoPicker = () => {
    if (!uploadingPhoto) {
      fileInputRef.current?.click();
    }
  };

  const uploadAdminPhoto = async (file) => {
    if (!file) {
      toast.error("Please select a photo");
      return;
    }

    if (!token) {
      toast.error("Please login again");
      return;
    }

    setUploadingPhoto(true);

    try {
      const formData = new FormData();
      formData.append("token", token);
      formData.append("photo", file);

      const res = await fetch(`${baseUrl}/settings/updateAdminPhoto.php`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message || "Profile photo updated");

        setAdminForm((prev) => ({
          ...prev,
          profile_photo: data.photo,
        }));
        setPhotoVersion(Date.now());

        let storedUser = null;
        try {
          storedUser = JSON.parse(localStorage.getItem("user"));
        } catch {
          storedUser = null;
        }

        if (storedUser) {
          localStorage.setItem(
            "user",
            JSON.stringify({
              ...storedUser,
              profile_photo: data.photo,
            })
          );
        }

        window.dispatchEvent(new Event("userUpdated"));

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        toast.error(data.message || "Failed to update profile photo");
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;
    await uploadAdminPhoto(file);
  };

  const saveSystemSettings = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("Please login again");
      return;
    }

    setSavingSettings(true);

    try {
      const res = await fetch(`${baseUrl}/settings/updateSystemSettings.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          ...settingsForm,
          min_booking_nights: Number(settingsForm.min_booking_nights),
          max_booking_nights: Number(settingsForm.max_booking_nights),
          free_cancellation_days: Number(settingsForm.free_cancellation_days),
          notify_new_booking: Number(settingsForm.notify_new_booking),
          notify_booking_cancelled: Number(settingsForm.notify_booking_cancelled),
          notify_new_review: Number(settingsForm.notify_new_review),
          notify_vendor_registration: Number(
            settingsForm.notify_vendor_registration
          ),
        }),
      });

      const data = await res.json();

      if (data.success) {
        if (data.changed === false) {
          toast.error("No changes to save");
        } else {
          toast.success(data.message || "System settings updated");
        }
      } else {
        toast.error(data.message || "Failed to update system settings");
      }
    } catch {
      toast.error("Failed to update system settings");
    } finally {
      setSavingSettings(false);
    }
  };

  const saveAdminProfile = async () => {
    if (!token) {
      toast.error("Please login again");
      return;
    }

    if (!adminForm.full_name.trim() || !adminForm.email.trim()) {
      toast.error("Full name and email are required");
      return;
    }

    let storedUser = null;
    try {
      storedUser = JSON.parse(localStorage.getItem("user"));
    } catch {
      storedUser = null;
    }

    const currentName = storedUser?.full_name || "";
    const currentEmail = storedUser?.email || "";

    if (
      adminForm.full_name.trim() === currentName.trim() &&
      adminForm.email.trim() === currentEmail.trim()
    ) {
      toast.error("No changes to save");
      return;
    }

    setSavingProfile(true);

    try {
      const res = await fetch(`${baseUrl}/settings/updateAdminProfile.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          full_name: adminForm.full_name.trim(),
          email: adminForm.email.trim(),
        }),
      });

      const data = await res.json();

      if (data.success) {
        if (data.changed === false) {
          toast.error("No changes to save");
        } else {
          toast.success(data.message || "Admin profile updated");

          if (storedUser) {
            localStorage.setItem(
              "user",
              JSON.stringify({
                ...storedUser,
                full_name: adminForm.full_name.trim(),
                email: adminForm.email.trim(),
              })
            );
          }

          window.dispatchEvent(new Event("userUpdated"));
        }
      } else {
        toast.error(data.message || "Failed to update admin profile");
      }
    } catch {
      toast.error("Failed to update admin profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const saveAdminPassword = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("Please login again");
      return;
    }

    if (
      !passwordForm.current_password ||
      !passwordForm.new_password ||
      !passwordForm.confirm_password
    ) {
      toast.error("All password fields are required");
      return;
    }

    if (passwordForm.new_password.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error("New password and confirm password do not match");
      return;
    }

    setSavingPassword(true);

    try {
      const res = await fetch(`${baseUrl}/settings/updateAdminPassword.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          ...passwordForm,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message || "Password updated successfully");
        setPasswordForm(defaultPassword);
      } else {
        toast.error(data.message || "Failed to update password");
      }
    } catch {
      toast.error("Failed to update password");
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.settingsPage}>
        <div className={styles.loadingState}>Loading settings...</div>
      </div>
    );
  }

  return (
    <div className={styles.settingsPage}>
      <div className={styles.pageHeader}>
        <div>
          <h1>System Settings</h1>
          <p>
            Manage platform configuration, booking rules, notifications, and
            admin account.
          </p>
        </div>
      </div>

      <form className={styles.card} onSubmit={saveSystemSettings}>
        <div className={styles.cardHeader}>
          <h2>Platform Settings</h2>
          <p>Core settings used across the StayEase platform.</p>
        </div>

        <div className={styles.grid}>
          <div className={styles.formGroup}>
            <label>Platform Name</label>
            <input
              type="text"
              name="platform_name"
              value={settingsForm.platform_name}
              onChange={handleSettingsChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Support Email</label>
            <input
              type="email"
              name="support_email"
              value={settingsForm.support_email}
              onChange={handleSettingsChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Support Phone</label>
            <input
              type="text"
              name="support_phone"
              value={settingsForm.support_phone}
              onChange={handleSettingsChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Default Currency</label>
            <input
              type="text"
              name="default_currency"
              value={settingsForm.default_currency}
              onChange={handleSettingsChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Timezone</label>
            <input
              type="text"
              name="timezone"
              value={settingsForm.timezone}
              onChange={handleSettingsChange}
            />
          </div>
        </div>

        <div className={styles.cardHeader}>
          <h2>Booking Rules</h2>
          <p>Define how bookings behave platform-wide.</p>
        </div>

        <div className={styles.grid}>
          <div className={styles.formGroup}>
            <label>Minimum Booking Nights</label>
            <input
              type="number"
              name="min_booking_nights"
              min="1"
              value={settingsForm.min_booking_nights}
              onChange={handleSettingsChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Maximum Booking Nights</label>
            <input
              type="number"
              name="max_booking_nights"
              min="1"
              value={settingsForm.max_booking_nights}
              onChange={handleSettingsChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Default Check-in Time</label>
            <input
              type="time"
              name="default_check_in_time"
              value={settingsForm.default_check_in_time}
              onChange={handleSettingsChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Default Check-out Time</label>
            <input
              type="time"
              name="default_check_out_time"
              value={settingsForm.default_check_out_time}
              onChange={handleSettingsChange}
            />
          </div>
        </div>

        <div className={styles.cardHeader}>
          <h2>Cancellation Policy</h2>
          <p>Configure cancellation and no-show behavior.</p>
        </div>

        <div className={styles.grid}>
          <div className={styles.formGroup}>
            <label>Free Cancellation Days</label>
            <input
              type="number"
              name="free_cancellation_days"
              min="0"
              value={settingsForm.free_cancellation_days}
              onChange={handleSettingsChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label>No-show Charge Type</label>
            <select
              name="no_show_charge_type"
              value={settingsForm.no_show_charge_type}
              onChange={handleSettingsChange}
            >
              <option value="none">None</option>
              <option value="one_night">One Night</option>
              <option value="full_amount">Full Amount</option>
            </select>
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label>Cancellation Policy Text</label>
            <textarea
              name="cancellation_policy_text"
              rows="4"
              value={settingsForm.cancellation_policy_text}
              onChange={handleSettingsChange}
            />
          </div>
        </div>

        <div className={styles.cardHeader}>
          <h2>Notification Settings</h2>
          <p>Choose which system notifications stay enabled.</p>
        </div>

        <div className={styles.checkboxList}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="notify_new_booking"
              checked={Boolean(settingsForm.notify_new_booking)}
              onChange={handleSettingsChange}
            />
            Notify on new booking
          </label>

          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="notify_booking_cancelled"
              checked={Boolean(settingsForm.notify_booking_cancelled)}
              onChange={handleSettingsChange}
            />
            Notify on booking cancellation
          </label>

          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="notify_new_review"
              checked={Boolean(settingsForm.notify_new_review)}
              onChange={handleSettingsChange}
            />
            Notify on new review
          </label>

          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="notify_vendor_registration"
              checked={Boolean(settingsForm.notify_vendor_registration)}
              onChange={handleSettingsChange}
            />
            Notify on vendor registration
          </label>
        </div>

        <div className={styles.actions}>
          <button
            type="submit"
            className={styles.primaryBtn}
            disabled={savingSettings}
          >
            {savingSettings ? "Saving..." : "Save System Settings"}
          </button>
        </div>
      </form>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2>Admin Profile</h2>
          <p>Update admin account details and profile image.</p>
        </div>

        <div className={styles.photoSection}>
          <div className={styles.photoPreviewWrap}>
            {adminForm.profile_photo ? (
              <img
                src={profilePhotoSrc}
                alt="Admin profile"
                className={styles.photoPreview}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className={styles.photoPlaceholder}>No Photo</div>
            )}
          </div>

          <div className={styles.photoControls}>
            <label className={styles.uploadLabel}>Profile Photo</label>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handlePhotoChange}
              style={{ display: "none" }}
            />

            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={openPhotoPicker}
              disabled={uploadingPhoto}
            >
              {uploadingPhoto ? "Uploading..." : "Choose Photo"}
            </button>
          </div>
        </div>

        <div className={styles.grid}>
          <div className={styles.formGroup}>
            <label>Full Name</label>
            <div className={styles.inputWrap}>
              <User size={16} />
              <input
                type="text"
                name="full_name"
                value={adminForm.full_name}
                onChange={handleAdminChange}
                placeholder="Enter full name"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Email</label>
            <div className={styles.inputWrap}>
              <Mail size={16} />
              <input
                type="email"
                name="email"
                value={adminForm.email}
                onChange={handleAdminChange}
                placeholder="Enter email"
              />
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.primaryBtn}
            disabled={savingProfile}
            onClick={saveAdminProfile}
          >
            {savingProfile ? "Saving..." : "Save Admin Profile"}
          </button>
        </div>
      </div>

      <form className={styles.card} onSubmit={saveAdminPassword}>
        <div className={styles.cardHeader}>
          <h2>Security</h2>
          <p>Change admin password securely.</p>
        </div>

        <div className={styles.grid}>
          <div className={styles.formGroup}>
            <label>Current Password</label>
            <div className={styles.passwordWrap}>
              <Shield size={16} />
              <input
                type={showPasswords.current ? "text" : "password"}
                name="current_password"
                autoComplete="current-password"
                value={passwordForm.current_password}
                onChange={handlePasswordChange}
                placeholder="Enter current password"
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => togglePasswordVisibility("current")}
              >
                {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>New Password</label>
            <div className={styles.passwordWrap}>
              <Shield size={16} />
              <input
                type={showPasswords.next ? "text" : "password"}
                name="new_password"
                autoComplete="new-password"
                value={passwordForm.new_password}
                onChange={handlePasswordChange}
                placeholder="Enter new password"
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => togglePasswordVisibility("next")}
              >
                {showPasswords.next ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Confirm Password</label>
            <div className={styles.passwordWrap}>
              <Shield size={16} />
              <input
                type={showPasswords.confirm ? "text" : "password"}
                name="confirm_password"
                autoComplete="new-password"
                value={passwordForm.confirm_password}
                onChange={handlePasswordChange}
                placeholder="Confirm new password"
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => togglePasswordVisibility("confirm")}
              >
                {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <button
            type="submit"
            className={styles.primaryBtn}
            disabled={savingPassword}
          >
            {savingPassword ? "Saving..." : "Update Password"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;