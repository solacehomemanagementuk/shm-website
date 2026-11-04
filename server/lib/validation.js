export const normalizeEmail = (value) => value.trim().toLowerCase();
export const normalizeUsername = (value) => value.trim().toLowerCase();

export const validateRegistration = (input) => {
  const errors = {};
  const fullName = typeof input.fullName === "string" ? input.fullName.trim() : "";
  const phone = typeof input.phone === "string" ? input.phone.trim() : "";
  const email = typeof input.email === "string" ? normalizeEmail(input.email) : "";
  const username = typeof input.username === "string" ? normalizeUsername(input.username) : "";
  const password = typeof input.password === "string" ? input.password : "";
  const confirmPassword = typeof input.confirmPassword === "string" ? input.confirmPassword : "";

  if (!fullName || fullName.length > 120 || /[\u0000-\u001f]/.test(fullName)) {
    errors.fullName = "Enter your full name (up to 120 characters).";
  }
  const phoneDigits = phone.replace(/\D/g, "");
  if (!/^\+?[0-9 ()-]{7,24}$/.test(phone) || phoneDigits.length < 7 || phoneDigits.length > 15) {
    errors.phone = "Enter a valid phone number with 7 to 15 digits.";
  }
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email address.";
  }
  if (!/^[a-z0-9._-]{3,32}$/.test(username)) {
    errors.username = "Use 3 to 32 letters, numbers, dots, underscores or hyphens.";
  }
  if (password.length < 12 || password.length > 128) {
    errors.password = "Use a password between 12 and 128 characters.";
  }
  if (confirmPassword !== password) {
    errors.confirmPassword = "Your passwords do not match.";
  }

  return {
    errors,
    data: { fullName, phone, email, username, password }
  };
};
