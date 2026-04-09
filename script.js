// script.js
document.addEventListener("DOMContentLoaded", function () {
  const passwordInput = document.getElementById("password-input");
  const togglePassword = document.getElementById("toggle-password");
  const strengthMeterFill = document.getElementById("strength-meter-fill");
  const strengthPercentage = document.getElementById("strength-percentage");
  const strengthText = document.getElementById("strength-text");
  const suggestionsList = document.getElementById("suggestions-list");
  const hackProbability = document.getElementById("hack-probability");
  const passwordScore = document.getElementById("password-score");
  const entropyBits = document.getElementById("entropy-bits");
  const onlineTime = document.getElementById("online-time");
  const offlineTime = document.getElementById("offline-time");
  const gpuTime = document.getElementById("gpu-time");
  const onlineProgress = document.getElementById("online-progress");
  const offlineProgress = document.getElementById("offline-progress");
  const gpuProgress = document.getElementById("gpu-progress");

  // Toggle password visibility
  togglePassword.addEventListener("click", function () {
    const type =
      passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);
    this.innerHTML =
      type === "password"
        ? '<i class="fas fa-eye"></i>'
        : '<i class="fas fa-eye-slash"></i>';
  });

  // Analyze password on input
  passwordInput.addEventListener("input", function () {
    const password = this.value;
    analyzePassword(password);
  });

  function analyzePassword(password) {
    // Reset if empty
    if (!password) {
      resetUI();
      return;
    }

    // Calculate password metrics
    const length = password.length;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    const hasCommonPattern = checkCommonPatterns(password);
    const hasRepeatedChars = /(.)\1{2,}/.test(password);
    const hasSequentialChars =
      /(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(
        password
      );

    // Calculate character set size
    let charsetSize = 0;
    if (hasLower) charsetSize += 26;
    if (hasUpper) charsetSize += 26;
    if (hasNumbers) charsetSize += 10;
    if (hasSpecial) charsetSize += 32;

    // Calculate entropy
    const entropy = Math.log2(Math.pow(charsetSize, length));
    entropyBits.textContent = Math.round(entropy);

    // Calculate strength score (0-100)
    let score = 0;

    // Length contributes up to 40 points
    score += Math.min(40, (length / 20) * 40);

    // Character variety contributes up to 30 points
    let varietyScore = 0;
    if (hasLower) varietyScore += 7.5;
    if (hasUpper) varietyScore += 7.5;
    if (hasNumbers) varietyScore += 7.5;
    if (hasSpecial) varietyScore += 7.5;
    score += varietyScore;

    // Entropy contributes up to 30 points
    score += Math.min(30, (entropy / 100) * 30);

    // Penalize for common patterns
    if (hasCommonPattern) score = Math.max(0, score - 15);
    if (hasRepeatedChars) score = Math.max(0, score - 10);
    if (hasSequentialChars) score = Math.max(0, score - 10);

    // Update strength meter
    const roundedScore = Math.round(score);
    passwordScore.textContent = `${roundedScore}/100`;

    // Update strength meter UI
    strengthMeterFill.style.width = `${roundedScore}%`;
    strengthPercentage.textContent = `${roundedScore}%`;

    // Update strength text and color
    if (roundedScore < 20) {
      strengthText.textContent = "Very Weak";
      strengthMeterFill.style.backgroundColor = "var(--danger)";
    } else if (roundedScore < 40) {
      strengthText.textContent = "Weak";
      strengthMeterFill.style.backgroundColor = "#ff6b6b";
    } else if (roundedScore < 60) {
      strengthText.textContent = "Fair";
      strengthMeterFill.style.backgroundColor = "var(--warning)";
    } else if (roundedScore < 80) {
      strengthText.textContent = "Good";
      strengthMeterFill.style.backgroundColor = "#4cd964";
    } else {
      strengthText.textContent = "Excellent";
      strengthMeterFill.style.backgroundColor = "var(--success)";
    }

    // Update suggestions
    updateSuggestions(
      length,
      hasUpper,
      hasLower,
      hasNumbers,
      hasSpecial,
      hasCommonPattern,
      hasRepeatedChars,
      hasSequentialChars
    );

    // Calculate hack probability (inverse of strength)
    const hackProb = Math.max(1, 100 - roundedScore);
    hackProbability.textContent = `${hackProb}%`;

    // Calculate time to crack
    calculateTimeToCrack(entropy, length);
  }

  function checkCommonPatterns(password) {
    const commonPatterns = [
      "123",
      "abc",
      "qwerty",
      "password",
      "admin",
      "letmein",
      "welcome",
      "monkey",
      "dragon",
      "master",
      "hello",
      "freedom",
      "whatever",
      "qwerty123",
      "1q2w3e",
      "123qwe",
      "123456",
      "111111",
      "aaaaaa",
      "passw0rd",
      "admin123",
    ];

    const lowerPassword = password.toLowerCase();
    return commonPatterns.some((pattern) => lowerPassword.includes(pattern));
  }

  function updateSuggestions(
    length,
    hasUpper,
    hasLower,
    hasNumbers,
    hasSpecial,
    hasCommonPattern,
    hasRepeatedChars,
    hasSequentialChars
  ) {
    const suggestionItems =
      suggestionsList.querySelectorAll(".suggestion-item");

    // Length suggestion
    suggestionItems[0].className =
      length >= 12 ? "suggestion-item valid" : "suggestion-item";
    suggestionItems[0].innerHTML =
      length >= 12
        ? '<i class="fas fa-check"></i> Use at least 12 characters'
        : '<i class="fas fa-times"></i> Use at least 12 characters';

    // Uppercase suggestion
    suggestionItems[1].className = hasUpper
      ? "suggestion-item valid"
      : "suggestion-item";
    suggestionItems[1].innerHTML = hasUpper
      ? '<i class="fas fa-check"></i> Include uppercase letters'
      : '<i class="fas fa-times"></i> Include uppercase letters';

    // Lowercase suggestion
    suggestionItems[2].className = hasLower
      ? "suggestion-item valid"
      : "suggestion-item";
    suggestionItems[2].innerHTML = hasLower
      ? '<i class="fas fa-check"></i> Include lowercase letters'
      : '<i class="fas fa-times"></i> Include lowercase letters';

    // Numbers suggestion
    suggestionItems[3].className = hasNumbers
      ? "suggestion-item valid"
      : "suggestion-item";
    suggestionItems[3].innerHTML = hasNumbers
      ? '<i class="fas fa-check"></i> Include numbers'
      : '<i class="fas fa-times"></i> Include numbers';

    // Special characters suggestion
    suggestionItems[4].className = hasSpecial
      ? "suggestion-item valid"
      : "suggestion-item";
    suggestionItems[4].innerHTML = hasSpecial
      ? '<i class="fas fa-check"></i> Include special characters'
      : '<i class="fas fa-times"></i> Include special characters';

    // Common patterns suggestion
    const commonPatternsValid =
      !hasCommonPattern && !hasRepeatedChars && !hasSequentialChars;
    suggestionItems[5].className = commonPatternsValid
      ? "suggestion-item valid"
      : "suggestion-item";
    suggestionItems[5].innerHTML = commonPatternsValid
      ? '<i class="fas fa-check"></i> Avoid common patterns'
      : '<i class="fas fa-times"></i> Avoid common patterns';
  }

  function calculateTimeToCrack(entropy, length) {
    // Online attack (throttled) - 10 attempts/second
    const onlineAttemptsPerSecond = 10;
    const onlineTimeToCrack = Math.pow(2, entropy) / onlineAttemptsPerSecond;

    // Offline attack (fast hash) - 10,000 attempts/second
    const offlineAttemptsPerSecond = 10000;
    const offlineTimeToCrack = Math.pow(2, entropy) / offlineAttemptsPerSecond;

    // GPU attack - 1,000,000,000 attempts/second
    const gpuAttemptsPerSecond = 1000000000;
    const gpuTimeToCrack = Math.pow(2, entropy) / gpuAttemptsPerSecond;

    // Format time for display
    onlineTime.textContent = formatTime(onlineTimeToCrack);
    offlineTime.textContent = formatTime(offlineTimeToCrack);
    gpuTime.textContent = formatTime(gpuTimeToCrack);

    // Update progress bars based on password strength
    const score = parseInt(passwordScore.textContent);
    onlineProgress.style.width = `${Math.min(100, (100 - score) / 2)}%`;
    onlineProgress.style.backgroundColor = getProgressColor(score, 0);

    offlineProgress.style.width = `${Math.min(100, (100 - score) / 1.5)}%`;
    offlineProgress.style.backgroundColor = getProgressColor(score, 1);

    gpuProgress.style.width = `${Math.min(100, (100 - score) / 1.2)}%`;
    gpuProgress.style.backgroundColor = getProgressColor(score, 2);
  }

  function getProgressColor(score, index) {
    if (score < 20) return "var(--danger)";
    if (score < 40) return "#ff6b6b";
    if (score < 60) return "var(--warning)";
    if (score < 80) return "#4cd964";
    return "var(--success)";
  }

  function formatTime(seconds) {
    if (seconds < 1) return "Instantly";
    if (seconds < 60) return "< 1 minute";

    const minutes = seconds / 60;
    if (minutes < 60)
      return `${Math.round(minutes)} minute${
        Math.round(minutes) !== 1 ? "s" : ""
      }`;

    const hours = minutes / 60;
    if (hours < 24)
      return `${Math.round(hours)} hour${Math.round(hours) !== 1 ? "s" : ""}`;

    const days = hours / 24;
    if (days < 30)
      return `${Math.round(days)} day${Math.round(days) !== 1 ? "s" : ""}`;

    const months = days / 30;
    if (months < 12)
      return `${Math.round(months)} month${
        Math.round(months) !== 1 ? "s" : ""
      }`;

    const years = months / 12;
    if (years < 100)
      return `${Math.round(years)} year${Math.round(years) !== 1 ? "s" : ""}`;

    const centuries = years / 100;
    if (centuries < 1000)
      return `${Math.round(centuries)} century${
        Math.round(centuries) !== 1 ? "s" : ""
      }`;

    return "Millions of years";
  }

  function resetUI() {
    strengthMeterFill.style.width = "0%";
    strengthPercentage.textContent = "0%";
    strengthText.textContent = "Very Weak";
    passwordScore.textContent = "0/100";
    hackProbability.textContent = "0%";
    entropyBits.textContent = "0";

    onlineTime.textContent = "Instantly";
    offlineTime.textContent = "Instantly";
    gpuTime.textContent = "Instantly";

    onlineProgress.style.width = "0%";
    offlineProgress.style.width = "0%";
    gpuProgress.style.width = "0%";

    const suggestionItems =
      suggestionsList.querySelectorAll(".suggestion-item");
    suggestionItems.forEach((item) => {
      item.className = "suggestion-item";
      item.innerHTML = item.innerHTML.replace("fa-check", "fa-times");
    });
  }

  // Initialize with a sample password for demonstration
  setTimeout(() => {
    passwordInput.value = "SecurePass123!";
    analyzePassword("SecurePass123!");
  }, 800);
});
