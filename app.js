// ==================== Game State ====================
const gameState = {
  playerScore: 0,
  computerScore: 0,
  roundNumber: 1,
  winTarget: 5,
  soundEnabled: true,
  animationEnabled: true,
  gameOver: false,
};

// ==================== DOM Elements ====================
const elements = {
  playerScore: document.getElementById("player-score"),
  computerScore: document.getElementById("computer-score"),
  roundNumber: document.getElementById("round-number"),
  playerChoiceEmoji: document.getElementById("player-choice-emoji"),
  computerChoiceEmoji: document.getElementById("computer-choice-emoji"),
  battleResult: document.getElementById("battle-result"),
  choiceButtons: document.querySelectorAll(".choice-btn"),
  resetBtn: document.getElementById("reset-btn"),
  settingsBtn: document.getElementById("settings-btn"),
  settingsPanel: document.getElementById("settings-panel"),
  closeSettings: document.getElementById("close-settings"),
  winTarget: document.getElementById("win-target"),
  soundToggle: document.getElementById("sound-toggle"),
  animationToggle: document.getElementById("animation-toggle"),
  confettiContainer: document.getElementById("confetti-container"),
  toast: document.getElementById("toast"),
  particles: document.getElementById("particles"),
};

// ==================== Choice Mappings ====================
const choices = {
  rock: { emoji: "✊", name: "Rock", beats: "scissors" },
  paper: { emoji: "✋", name: "Paper", beats: "rock" },
  scissors: { emoji: "✌️", name: "Scissors", beats: "paper" },
};

// ==================== Sound Effects (Text-based) ====================
const soundEffects = {
  win: ["🎉", "✨", "🌟", "💫", "⭐"],
  lose: ["😢", "💔", "😞", "😔", "😿"],
  tie: ["🤝", "⚖️", "🔄", "♻️", "🆗"],
  click: ["👆", "👉", "👇", "👈", "☝️"],
};

// ==================== Initialize Particles ====================
function initParticles() {
  for (let i = 0; i < 30; i++) {
    const particle = document.createElement("div");
    particle.className = "particle";
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.animationDelay = `${Math.random() * 15}s`;
    particle.style.animationDuration = `${10 + Math.random() * 10}s`;
    elements.particles.appendChild(particle);
  }
}

// ==================== Toast Notification ====================
function showToast(message, duration = 2000) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");

  setTimeout(() => {
    elements.toast.classList.remove("show");
  }, duration);
}

// ==================== Confetti Animation ====================
function createConfetti() {
  if (!gameState.animationEnabled) return;

  const colors = [
    "#ff6b6b",
    "#4ecdc4",
    "#45b7d1",
    "#f9ca24",
    "#6c5ce7",
    "#fd79a8",
  ];
  const confettiCount = 50;

  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement("div");
    confetti.className = "confetti-piece";
    confetti.style.left = `${Math.random() * 100}%`;
    confetti.style.backgroundColor =
      colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDelay = `${Math.random() * 0.5}s`;
    confetti.style.animationDuration = `${2 + Math.random()}s`;

    elements.confettiContainer.appendChild(confetti);

    setTimeout(() => confetti.remove(), 3000);
  }
}

// ==================== Text Sound Effect ====================
function playTextSound(type) {
  if (!gameState.soundEnabled) return;

  const effect =
    soundEffects[type][Math.floor(Math.random() * soundEffects[type].length)];
  showToast(effect, 800);
}

// ==================== Computer Choice ====================
function getComputerChoice() {
  const choiceKeys = Object.keys(choices);
  const randomIndex = Math.floor(Math.random() * choiceKeys.length);
  return choiceKeys[randomIndex];
}

// ==================== Determine Winner ====================
function determineWinner(playerChoice, computerChoice) {
  if (playerChoice === computerChoice) {
    return "tie";
  }

  if (choices[playerChoice].beats === computerChoice) {
    return "player";
  }

  return "computer";
}

// ==================== Update Display ====================
function updateDisplay(playerChoice, computerChoice, winner) {
  // Update choice displays
  elements.playerChoiceEmoji.textContent = choices[playerChoice].emoji;
  elements.computerChoiceEmoji.textContent = choices[computerChoice].emoji;

  // Apply animations
  if (gameState.animationEnabled) {
    elements.playerChoiceEmoji.classList.remove(
      "shake",
      "win-animation",
      "lose-animation"
    );
    elements.computerChoiceEmoji.classList.remove(
      "shake",
      "win-animation",
      "lose-animation"
    );

    void elements.playerChoiceEmoji.offsetWidth; // Trigger reflow

    if (winner === "player") {
      elements.playerChoiceEmoji.classList.add("win-animation");
      elements.computerChoiceEmoji.classList.add("lose-animation");
    } else if (winner === "computer") {
      elements.playerChoiceEmoji.classList.add("lose-animation");
      elements.computerChoiceEmoji.classList.add("win-animation");
    } else {
      elements.playerChoiceEmoji.classList.add("shake");
      elements.computerChoiceEmoji.classList.add("shake");
    }
  }

  // Update result text
  const resultText = elements.battleResult.querySelector(".result-text");

  if (winner === "player") {
    resultText.textContent = `🎉 You Win! ${choices[playerChoice].name} beats ${choices[computerChoice].name}!`;
    resultText.style.color = "#10b981";
    playTextSound("win");
  } else if (winner === "computer") {
    resultText.textContent = `💔 You Lose! ${choices[computerChoice].name} beats ${choices[playerChoice].name}!`;
    resultText.style.color = "#ef4444";
    playTextSound("lose");
  } else {
    resultText.textContent = `🤝 It's a Tie! Both chose ${choices[playerChoice].name}!`;
    resultText.style.color = "#f59e0b";
    playTextSound("tie");
  }
}

// ==================== Update Scores ====================
function updateScores() {
  elements.playerScore.textContent = gameState.playerScore;
  elements.computerScore.textContent = gameState.computerScore;
  elements.roundNumber.textContent = gameState.roundNumber;
}

// ==================== Check Game Over ====================
function checkGameOver() {
  if (gameState.playerScore >= gameState.winTarget) {
    gameState.gameOver = true;
    createConfetti();
    showToast(
      `🏆 Victory! You won ${gameState.playerScore}-${gameState.computerScore}!`,
      4000
    );

    setTimeout(() => {
      if (confirm("🎉 Congratulations! You won the game! Play again?")) {
        resetGame();
      }
    }, 1000);

    return true;
  }

  if (gameState.computerScore >= gameState.winTarget) {
    gameState.gameOver = true;
    showToast(
      `😔 Game Over! Computer won ${gameState.computerScore}-${gameState.playerScore}!`,
      4000
    );

    setTimeout(() => {
      if (confirm("💪 Better luck next time! Try again?")) {
        resetGame();
      }
    }, 1000);

    return true;
  }

  return false;
}

// ==================== Play Round ====================
function playRound(playerChoice) {
  if (gameState.gameOver) return;

  playTextSound("click");

  // Highlight selected button
  elements.choiceButtons.forEach((btn) => btn.classList.remove("selected"));
  const selectedBtn = document.querySelector(`[data-choice="${playerChoice}"]`);
  if (selectedBtn) {
    selectedBtn.classList.add("selected");
    setTimeout(() => selectedBtn.classList.remove("selected"), 500);
  }

  // Get computer choice
  const computerChoice = getComputerChoice();

  // Determine winner
  const winner = determineWinner(playerChoice, computerChoice);

  // Update scores
  if (winner === "player") {
    gameState.playerScore++;
  } else if (winner === "computer") {
    gameState.computerScore++;
  }

  // Update display
  updateDisplay(playerChoice, computerChoice, winner);
  updateScores();

  // Increment round
  if (winner !== "tie") {
    gameState.roundNumber++;
  }

  // Check if game is over
  checkGameOver();
}

// ==================== Reset Game ====================
function resetGame() {
  gameState.playerScore = 0;
  gameState.computerScore = 0;
  gameState.roundNumber = 1;
  gameState.gameOver = false;

  updateScores();

  elements.playerChoiceEmoji.textContent = "❓";
  elements.computerChoiceEmoji.textContent = "❓";

  const resultText = elements.battleResult.querySelector(".result-text");
  resultText.textContent = "Make your move!";
  resultText.style.color = "#1e293b";

  showToast("🔄 Game Reset! Good luck!", 1500);
}

// ==================== Settings ====================
function toggleSettings() {
  elements.settingsPanel.classList.toggle("active");
}

function applySettings() {
  gameState.winTarget = parseInt(elements.winTarget.value);
  gameState.soundEnabled = elements.soundToggle.checked;
  gameState.animationEnabled = elements.animationToggle.checked;

  showToast("⚙️ Settings saved!", 1500);
}

// ==================== Event Listeners ====================
elements.choiceButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const choice = btn.getAttribute("data-choice");
    playRound(choice);
  });
});

elements.resetBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to reset the game?")) {
    resetGame();
  }
});

elements.settingsBtn.addEventListener("click", toggleSettings);
elements.closeSettings.addEventListener("click", () => {
  applySettings();
  toggleSettings();
});

// Settings changes
elements.winTarget.addEventListener("change", applySettings);
elements.soundToggle.addEventListener("change", applySettings);
elements.animationToggle.addEventListener("change", applySettings);

// ==================== Keyboard Controls ====================
document.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();

  if (key === "r") {
    playRound("rock");
  } else if (key === "p") {
    playRound("paper");
  } else if (key === "s") {
    playRound("scissors");
  } else if (key === " ") {
    e.preventDefault();
    if (confirm("Are you sure you want to reset the game?")) {
      resetGame();
    }
  } else if (key === "escape") {
    if (elements.settingsPanel.classList.contains("active")) {
      applySettings();
      toggleSettings();
    }
  }
});

// ==================== Initialize ====================
function init() {
  initParticles();
  updateScores();
  showToast("🎮 Welcome! Press R, P, or S to play!", 3000);
}

// Start the game
init();
