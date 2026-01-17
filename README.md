# Solid Octo Waffle

## Description

The Solid Octo Waffle is a simple web application designed to encourage you to stay active by generating a random daily sport exercise. It keeps track of your progress through a local score system, motivating you to complete your exercises every day.

### Key Features:

- **Random Daily Exercises**: Generates a new sport exercise each day to keep your routine interesting and diversified.
- **Motivational Scoring**:
  - Your score increases each day you complete the exercise.
  - Your score decreases if you miss a day, and the penalty speed increases the longer you go without completing an exercise.
- **Local Storage**:
  - Stores all data in your browser using localStorage, meaning there's no need for a backend or external database.
  - Ensures your data is secure and accessible only to you on your device.

## How It Works

1. **Daily Exercise Generation**:
   - When you open the app, a random sport exercise is displayed for you to complete.
   - Exercises are designed to be simple yet effective, catering to all fitness levels.

2. **Score Tracking**:
   - When you indicate after completing the exercise, your score increases.
   - If you skip a day, the app tracks the number of days missed. The longer you go without completing an exercise, the faster your score decreases.
   - Your score is calculated and displayed dynamically on the app.

3. **Local Data Storage**:
   - Your exercise history and score are saved between sessions using browser localStorage. You can close the app or refresh the page without losing your progress.

## Live Demo

The app is available online at [https://sow.apps.smeanox.com](https://sow.apps.smeanox.com). Access it anytime from your browser to start your daily exercise journey!

## Technology Stack

- **Front-End**:
  - HTML, CSS, and JavaScript: The app uses these core web technologies for responsive and user-friendly design.
- **Storage**:
  - `localStorage` is used for persisting user data like the daily exercise, progress, and score locally in the browser.

## Getting Started Locally

### Prerequisites

To use the app, all you need is a modern web browser (e.g., Chrome, Firefox, Edge, or Safari).

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/SmBe19/solid-octo-waffle.git
   ```
2. Open the `index.html` file in your browser.

### Usage

1. Open the [app](https://sow.apps.smeanox.com) or run it locally in your browser.
2. View your randomly assigned exercise for the day.
3. Complete the exercise and mark it as done to increase your score.
4. Check your progress and stay motivated to complete your daily exercises!

## Maintaining Your Score

- Always mark your daily exercises as complete to keep your score going up!
- Missing consecutive days will reduce your score at an increasing rate. Stay consistent to maximize your progress.

## Contribution

Contributions are welcome! Follow these steps to get started:

1. Fork this repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes.
4. Commit your changes (`git commit -m "Add new feature"`).
5. Push to the branch (`git push origin feature-branch`).
6. Create a pull request.

---

Stay active and healthy with the Solid Octo Waffle!