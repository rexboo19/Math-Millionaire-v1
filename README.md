# Math Millionaire - Who Wants to Be a Math Millionaire?

A web-based math competition game inspired by "Who Wants to Be a Millionaire?" built with Bootstrap and vanilla JavaScript.

## Features

### 🎯 Core Game Features
- **15 Progressive Math Questions** - From basic arithmetic to advanced calculus
- **Prize Ladder** - $100 to $1,000,000 with visual progress tracking
- **Interactive Question Interface** - Click to select answers with visual feedback
- **Responsive Design** - Works on desktop, tablet, and mobile devices

### 🆘 Lifelines System
- **50:50** - Removes two wrong answers, leaving you with the correct answer and one wrong answer
- **Phone a Friend** - Get advice from a "friend" who gives you a confident answer
- **Ask the Audience** - See how the audience would vote on each option

### 🎨 Visual Features
- **Millionaire Theme** - Gold and blue color scheme matching the original show
- **Smooth Animations** - Hover effects, transitions, and visual feedback
- **Prize Ladder Highlighting** - Current question and passed levels are highlighted
- **Modal Dialogs** - For game over screens and lifeline results

### 📱 Responsive Design
- **Mobile-First** - Optimized for all screen sizes
- **Touch-Friendly** - Large buttons and touch targets
- **Flexible Layout** - Adapts to different screen orientations

## How to Play

1. **Start the Game** - Click "Start Game" to begin
2. **Answer Questions** - Click on your chosen answer (A, B, C, or D)
3. **Use Lifelines** - Click on lifeline buttons when you need help
4. **Progress Through Levels** - Each correct answer moves you up the prize ladder
5. **Win or Lose** - Answer all 15 questions correctly to become a Math Millionaire!

## File Structure

```
Millionaire/
├── index.html          # Main HTML structure
├── styles.css          # Custom CSS styling
├── script.js           # Game logic and functionality
└── README.md           # This file
```

## Technical Details

### Technologies Used
- **HTML5** - Semantic structure
- **CSS3** - Modern styling with flexbox and grid
- **Bootstrap 5.3** - Responsive framework
- **Vanilla JavaScript** - No external dependencies
- **Font Awesome** - Icons
- **Google Fonts** - Typography

### Browser Support
- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## Customization

### Adding New Questions
Edit the `questions` array in `script.js`:

```javascript
{
    question: "Your math question here?",
    options: ["Option A", "Option B", "Option C", "Option D"],
    correct: 0, // Index of correct answer (0-3)
    difficulty: 1 // Difficulty level (1-5)
}
```

### Modifying Prize Ladder
Edit the `prizeLadder` array in `script.js`:

```javascript
this.prizeLadder = [
    100, 200, 300, 500, 1000, 2000, 4000, 8000, 16000, 32000,
    64000, 125000, 250000, 500000, 1000000
];
```

### Styling Customization
- Edit `styles.css` to change colors, fonts, or layout
- Modify CSS variables for consistent theming
- Add custom animations or transitions

## Game Rules

1. **15 Questions Total** - Each question has 4 multiple choice options
2. **Progressive Difficulty** - Questions get harder as you advance
3. **Three Lifelines** - Use them wisely, you only get one of each
4. **No Going Back** - Once you select an answer, it's final
5. **Quit Anytime** - You can quit and take your current winnings

## Educational Value

This game is perfect for:
- **Math Teachers** - Engaging way to review concepts
- **Students** - Practice math skills in a fun format
- **Math Competitions** - Host school or class competitions
- **Family Game Night** - Educational entertainment

## Future Enhancements

Potential improvements:
- **Sound Effects** - Add audio for correct/incorrect answers
- **Timer** - Add time limits for questions
- **Multiplayer** - Support for multiple players
- **Question Categories** - Algebra, Geometry, Calculus, etc.
- **Statistics** - Track player performance
- **Leaderboards** - High score tracking

## Getting Started

1. Download all files to a folder
2. Open `index.html` in a web browser
3. Start playing immediately - no installation required!

## License

This project is open source and available under the MIT License.

---

**Have fun becoming a Math Millionaire!** 🎓💰
