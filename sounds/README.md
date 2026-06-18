# Sound Effects for Math Millionaire

This folder should contain the following audio files for the game:

## Required Sound Files:

### Core Game Sounds:
- **Correct.mp3** - Plays when a correct answer is selected
- **incorrect.mp3** - Plays when an incorrect answer is selected
- **gameStart.mp3** - Plays when the game begins
- **gameOver.mp3** - Plays when the game ends (lose)
- **applause.mp3** - Plays when the game is won

### Lifeline Sounds:
- **lifeline.mp3** - Plays when a lifeline is used

## File Requirements:
- **Format**: MP3 files
- **Quality**: 44.1kHz, 16-bit or higher
- **Duration**: 1-3 seconds for most sounds
- **Volume**: Normalized to prevent clipping

## Sound Suggestions:

### Correct.mp3
- Short, positive sound
- Examples: "Ding!", "Chime", "Success beep"
- Duration: 0.5-1 second

### incorrect.mp3
- Short, negative sound
- Examples: "Buzz", "Error beep", "Wrong answer sound"
- Duration: 0.5-1 second

### gameStart.mp3
- Exciting, upbeat sound
- Examples: "Game start fanfare", "Drum roll", "Intro music"
- Duration: 2-3 seconds

### gameOver.mp3
- Disappointing but not harsh
- Examples: "Game over sound", "Losing chime"
- Duration: 1-2 seconds

### applause.mp3
- Celebratory sound
- Examples: "Applause", "Victory fanfare", "Success music"
- Duration: 2-4 seconds

### lifeline.mp3
- Distinctive, helpful sound
- Examples: "Phone ring", "Help sound", "Lifeline activation"
- Duration: 1-2 seconds

## How to Add Sounds:

1. **Create the sounds folder** in your project directory
2. **Add the MP3 files** with the exact names listed above
3. **Test the sounds** by playing the game
4. **Adjust volume** if needed (sounds are set to 60-80% volume)

## Fallback Behavior:
If sound files are missing, the game will continue to work normally but without audio feedback. Check the browser console for any audio loading errors.

## Browser Compatibility:
- Modern browsers support MP3 format
- Some browsers may require user interaction before playing audio
- Mobile browsers may have additional restrictions
