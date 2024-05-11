const symbols = '!@#$%^&*()_-+=[]{}|;:,.<>?';

function generatePasswords(length) {
  const characters = '0123456789abcdefghijklmnopqrstuvwxyz' + symbols;

  const generate = (prefix, remainingLength) => {
    if (remainingLength === 0) {
      console.log(prefix);
      return;
    }

    for (let i = 0; i < characters.length; i++) {
      const newPassword = prefix + characters[i];
      console.log(newPassword);
      generate(newPassword, remainingLength - 1);
    }
  };

  generate('', length);
}

const passwordLength = 8; // Change this to desired password length
generatePasswords(passwordLength);
