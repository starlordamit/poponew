export function generateSecurePassword(length: number = 12): string {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=<>?";
  let password = "";

  // Ensure at least one character from each category
  password += getRandomChar("abcdefghijklmnopqrstuvwxyz");
  password += getRandomChar("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
  password += getRandomChar("0123456789");
  password += getRandomChar("!@#$%^&*()_-+=<>?");

  // Fill the rest of the password
  for (let i = password.length; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }

  // Shuffle the password characters
  return shuffleString(password);
}

function getRandomChar(charset: string): string {
  const randomIndex = Math.floor(Math.random() * charset.length);
  return charset[randomIndex];
}

function shuffleString(str: string): string {
  const array = str.split("");
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array.join("");
}
