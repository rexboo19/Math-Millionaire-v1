// Math Millionaire Game Logic
class MathMillionaireGame {
    constructor() {
        this.currentQuestion = 0;
        this.score = 0;
        this.gameActive = false;
        // One set of lifelines per game (not per class)
        this.lifelines = {
            '50-50': true,
            'phone': true,
            'audience': true
        };
        
        // Initialize sound effects
        this.soundManager = new SoundManager();
        
        // Background music state
        this.backgroundMusicPlaying = false;
        
        // Topic prefixes that receive a 1.2× score bonus for matching classes
        this.weightedTopics = ['EG', 'DE', 'SP'];
        this.topicScoreMultiplier = 1.2;
        
        // Prize ladder amounts — one score per question (10 questions total)
        this.prizeLadder = [
            1000, 5000, 10000, 50000, 75000, 100000, 250000, 500000, 750000, 1000000
        ];
        
        // Game session ID for audience connection
        this.sessionId = null;
        
        // Chart instance for class scores
        this.classScoreChart = null;
        
        // Modal instance for lifeline/statistics
        this.lifelineModalInstance = null;
        this.processingAnswer = false; // Blocks extra clicks while stats are shown
        
        // Class list used for audience statistics only
        this.classes = [];
        
        // Load questions from localStorage or use defaults
        this.questions = this.loadQuestions();
        
        this.initializeGame();
    }
    
    // Number of questions played in one game (matches prize ladder length)
    getGameQuestionCount() {
        return Math.min(this.questions.length, this.prizeLadder.length);
    }
    
    // Calculate score for a class based on prize ladder and question topic weighting
    getClassScoreForQuestion(className, prizeAmount, questionTopic) {
        const topic = (questionTopic || '').trim().toUpperCase();
        const classNameUpper = (className || '').trim().toUpperCase();
        
        // EG/DE/SP topics: matching class prefix gets 1.2×, others get base prize
        if (this.weightedTopics.includes(topic) && classNameUpper.startsWith(topic)) {
            return Math.round(prizeAmount * this.topicScoreMultiplier);
        }
        
        return prizeAmount;
    }
    
    // Initialize game (async to load classes from Firebase)
    async initializeGame() {
        await this.loadClasses(); // Load available classes from Firebase/localStorage
        this.bindEvents();
        this.updatePrizeLadder();
        this.showStartScreen();
    }
    
    // Load questions from localStorage or use defaults
    loadQuestions() {
        const stored = localStorage.getItem('mathMillionaireQuestions');
        if (stored) {
            return JSON.parse(stored);
        } else {
            // Return default questions if none are stored
            return [
                {
                    question: "What is 15 + 27?",
                    options: ["42", "41", "43", "40"],
                    correct: 0,
                    topic: "Arithmetic"
                },
                {
                    question: "What is 8 × 7?",
                    options: ["54", "56", "58", "60"],
                    correct: 1,
                    topic: "Arithmetic"
                },
                {
                    question: "What is 144 ÷ 12?",
                    options: ["10", "11", "12", "13"],
                    correct: 2,
                    topic: "Arithmetic"
                },
                {
                    question: "What is 5² + 3²?",
                    options: ["32", "34", "36", "38"],
                    correct: 1,
                    topic: "Algebra"
                },
                {
                    question: "What is √64?",
                    options: ["6", "7", "8", "9"],
                    correct: 2,
                    topic: "Algebra"
                },
                {
                    question: "What is 2³ × 3²?",
                    options: ["70", "72", "74", "76"],
                    correct: 1,
                    topic: "Algebra"
                },
                {
                    question: "What is 15% of 200?",
                    options: ["25", "30", "35", "40"],
                    correct: 1,
                    topic: "Percentages"
                },
                {
                    question: "What is the area of a circle with radius 7? (π ≈ 3.14)",
                    options: ["147.86", "153.86", "159.86", "165.86"],
                    correct: 1,
                    topic: "Geometry"
                },
                {
                    question: "What is 3x + 5 = 20, find x?",
                    options: ["3", "4", "5", "6"],
                    correct: 2,
                    topic: "Algebra"
                },
                {
                    question: "What is the derivative of x²?",
                    options: ["x", "2x", "x²", "2x²"],
                    correct: 1,
                    topic: "Calculus"
                },
                {
                    question: "What is ∫(2x + 3)dx?",
                    options: ["x² + 3x + C", "2x² + 3x + C", "x² + 6x + C", "2x² + 6x + C"],
                    correct: 0,
                    topic: "Calculus"
                },
                {
                    question: "What is the limit of (x² - 4)/(x - 2) as x approaches 2?",
                    options: ["2", "3", "4", "5"],
                    correct: 2,
                    topic: "Calculus"
                },
                {
                    question: "What is the determinant of [[2,3],[4,5]]?",
                    options: ["-2", "-1", "1", "2"],
                    correct: 0,
                    topic: "Linear Algebra"
                },
                {
                    question: "What is the sum of the first 10 natural numbers?",
                    options: ["50", "55", "60", "65"],
                    correct: 1,
                    topic: "Sequences"
                },
                {
                    question: "What is the probability of rolling a 6 on a fair die?",
                    options: ["1/3", "1/4", "1/5", "1/6"],
                    correct: 3,
                    topic: "Probability"
                }
            ];
        }
    }
    
    // Load classes from Firebase or localStorage
    async loadClasses() {
        // Try to load from Firebase first, fallback to localStorage
        if (window.dataStore) {
            const stored = await window.dataStore.get('mathMillionaireClasses');
            if (stored && Array.isArray(stored)) {
                this.classes = stored.sort();
            } else {
                const localStored = localStorage.getItem('mathMillionaireClasses');
                if (localStored) {
                    this.classes = JSON.parse(localStored).sort();
                } else {
                    this.classes = [];
                }
            }
        } else {
            const stored = localStorage.getItem('mathMillionaireClasses');
            if (stored) {
                this.classes = JSON.parse(stored).sort();
            } else {
                this.classes = [];
            }
        }
    }
    
    // Bind event listeners
    bindEvents() {
        // Start game button
        document.getElementById('start-game').addEventListener('click', () => {
            this.startGame();
        });
        
        // Next question button
        document.getElementById('next-question').addEventListener('click', () => {
            this.nextQuestion();
        });
        
        // Quit game button
        document.getElementById('quit-game').addEventListener('click', () => {
            this.quitGame();
        });
        
        // Play again button
        document.getElementById('play-again').addEventListener('click', () => {
            this.resetGame();
        });
        
        // Option selection
        document.addEventListener('click', (e) => {
            if (e.target.closest('.option') && this.gameActive) {
                const option = e.target.closest('.option');
                this.selectOption(option);
            }
        });
        
        // Lifeline buttons
        document.getElementById('fifty-fifty').addEventListener('click', () => {
            this.useLifeline('50-50');
        });
        
        document.getElementById('phone-friend').addEventListener('click', () => {
            this.useLifeline('phone');
        });
        
        document.getElementById('ask-audience').addEventListener('click', () => {
            this.useLifeline('audience');
        });
        
        // Statistics button (can be clicked anytime, multiple times)
        document.getElementById('show-statistics').addEventListener('click', () => {
            this.showStatistics();
        });
    }
    showStartScreen() {
        document.getElementById('start-game').style.display = 'inline-block';
        document.getElementById('next-question').style.display = 'none';
        document.getElementById('quit-game').style.display = 'none';
        this.resetLifelines();
    }
    
    // Start the game
    startGame() {
        this.gameActive = true;
        this.currentQuestion = 0;
        this.score = 0;
        this.resetLifelines();
        this.updatePrizeLadder();
        
        // Generate unique session ID for this game
        this.sessionId = this.generateSessionId();
        
        // Store session ID using dataStore (Firebase or localStorage)
        this.initializeSession();
        
        // Generate and show QR code
        this.generateQRCode();
        
        // Load first question but skip the sound (will play after QR modal is closed)
        this.loadQuestion(true);
        
        // Play game start sound
        this.soundManager.play('gameStart');
        
        // Show music controls (they're inside the QR code corner, so they'll show when QR code shows)
        const musicControls = document.getElementById('music-controls');
        if (musicControls) {
            musicControls.style.display = 'block';
        }
        
        // Set up event listener for QR code modal close - play start question sound and background music for question 1
        const qrModalElement = document.getElementById('qrCodeModal');
        if (qrModalElement) {
            // Remove any existing listeners first
            qrModalElement.removeEventListener('hidden.bs.modal', this.onQRModalClose);
            
            // Create a one-time listener for when the modal is closed
            this.onQRModalClose = () => {
                // Only play the sound if we're still on question 1 (index 0)
                if (this.currentQuestion === 0) {
                    this.soundManager.play('startQuestion');
                    // Start background music when question 1 starts
                    this.soundManager.playBackgroundMusic();
                    this.backgroundMusicPlaying = true;
                }
                // Remove the listener after it fires once
                qrModalElement.removeEventListener('hidden.bs.modal', this.onQRModalClose);
            };
            
            qrModalElement.addEventListener('hidden.bs.modal', this.onQRModalClose);
        }
        
        document.getElementById('start-game').style.display = 'none';
        document.getElementById('quit-game').style.display = 'inline-block';
    }
    
    // Generate unique session ID
    generateSessionId() {
        return 'game_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    // Initialize session in dataStore (Firebase or localStorage)
    async initializeSession() {
        if (!window.dataStore) {
            console.warn('dataStore not available, using localStorage fallback');
            localStorage.setItem('currentGameSession', this.sessionId);
            localStorage.setItem(`gameSession_${this.sessionId}_active`, 'true');
            localStorage.setItem(`gameSession_${this.sessionId}_question`, '0');
            
            const scoresKey = `gameSession_${this.sessionId}_classScores`;
            const totalsKey = `gameSession_${this.sessionId}_classTotals`;
            if (!localStorage.getItem(scoresKey)) {
                const initialScores = {};
                this.classes.forEach(className => {
                    initialScores[className] = 0;
                });
                localStorage.setItem(scoresKey, JSON.stringify(initialScores));
            }
            if (!localStorage.getItem(totalsKey)) {
                localStorage.setItem(totalsKey, JSON.stringify(this.buildEmptyClassTotals()));
            }
            return;
        }
        
        // Use dataStore (Firebase or localStorage)
        await window.dataStore.set('currentGameSession', this.sessionId);
        await window.dataStore.set(`gameSession_${this.sessionId}_active`, 'true');
        await window.dataStore.set(`gameSession_${this.sessionId}_question`, '0');
        
        const scoresKey = `gameSession_${this.sessionId}_classScores`;
        const totalsKey = `gameSession_${this.sessionId}_classTotals`;
        const existingScores = await window.dataStore.get(scoresKey);
        if (!existingScores) {
            const initialScores = {};
            this.classes.forEach(className => {
                initialScores[className] = 0;
            });
            await window.dataStore.set(scoresKey, initialScores);
        }
        const existingTotals = await window.dataStore.get(totalsKey);
        if (!existingTotals) {
            await window.dataStore.set(totalsKey, this.buildEmptyClassTotals());
        }
    }
    
    // Generate QR code for audience to join
    generateQRCode() {
        // Get current page URL and construct audience URL
        // This works for both local development and GitHub Pages
        const origin = window.location.origin;
        let path = window.location.pathname;
        
        // Remove filename if present (e.g., index.html)
        if (path.endsWith('index.html')) {
            path = path.replace('index.html', '');
        }
        
        // Ensure path ends with /
        if (!path.endsWith('/')) {
            path += '/';
        }
        
        // Construct audience URL
        const audienceUrl = origin + path + 'audience.html?session=' + this.sessionId;
        
        // Clear previous QR code if exists
        const qrContainer = document.getElementById('qrcode');
        const qrCornerContainer = document.getElementById('qrcode-corner');
        const qrCornerDisplay = document.getElementById('qr-code-corner');
        
        if (qrContainer) qrContainer.innerHTML = '';
        if (qrCornerContainer) qrCornerContainer.innerHTML = '';
        
        // Show QR code in corner
        if (qrCornerDisplay) {
            qrCornerDisplay.style.display = 'block';
        }
        
        // Generate QR code using QRCode.js library
        // Wait a bit for library to load if needed
        setTimeout(() => {
            if (typeof QRCode !== 'undefined') {
                // Generate QR code for modal
                if (qrContainer) {
                    new QRCode(qrContainer, {
                        text: audienceUrl,
                        width: 256,
                        height: 256,
                        colorDark: '#000000',
                        colorLight: '#ffffff',
                        correctLevel: QRCode.CorrectLevel.H
                    });
                }
                
                // Generate QR code for corner display
                if (qrCornerContainer) {
                    new QRCode(qrCornerContainer, {
                        text: audienceUrl,
                        width: 200,
                        height: 200,
                        colorDark: '#000000',
                        colorLight: '#ffffff',
                        correctLevel: QRCode.CorrectLevel.H
                    });
                }
            } else {
                // Fallback: show URL if QRCode library not loaded
                if (qrContainer) {
                    this.generateQRCodeFallback(qrContainer, audienceUrl);
                }
                if (qrCornerContainer) {
                    this.generateQRCodeFallback(qrCornerContainer, audienceUrl);
                }
            }
        }, 100);
        
        // Set URL in input field
        const urlInput = document.getElementById('game-url');
        if (urlInput) {
            urlInput.value = audienceUrl;
        }
        
        // Show QR code modal
        const qrModal = new bootstrap.Modal(document.getElementById('qrCodeModal'));
        qrModal.show();
        
        // Add copy URL functionality
        document.getElementById('copy-url-btn').onclick = () => {
            const urlInput = document.getElementById('game-url');
            urlInput.select();
            urlInput.setSelectionRange(0, 99999); // For mobile devices
            
            // Use modern Clipboard API if available
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(audienceUrl).then(() => {
                    this.showCopyFeedback();
                });
            } else {
                // Fallback for older browsers
                document.execCommand('copy');
                this.showCopyFeedback();
            }
        };
    }
    
    // Show copy feedback
    showCopyFeedback() {
        const btn = document.getElementById('copy-url-btn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        btn.classList.add('btn-success');
        btn.classList.remove('btn-outline-light');
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.classList.remove('btn-success');
            btn.classList.add('btn-outline-light');
        }, 2000);
    }
    
    // Fallback QR code generation (simple text-based)
    generateQRCodeFallback(container, url) {
        container.innerHTML = `
            <div style="padding: 20px; background: white; border-radius: 10px;">
                <p style="color: #000; margin-bottom: 10px; font-weight: bold;">Scan with your phone camera or visit:</p>
                <p style="color: #0066cc; word-break: break-all; font-size: 0.9rem;">${url}</p>
            </div>
        `;
    }
    
    // Load current question
    loadQuestion(skipSound = false) {
        if (this.currentQuestion >= this.getGameQuestionCount()) {
            this.endGame(true);
            return;
        }
        
        // Play start question sound when displaying a new question (unless skipped)
        if (!skipSound) {
            this.soundManager.play('startQuestion');
            // Start or resume background music for subsequent questions
            if (!this.backgroundMusicPlaying) {
                this.soundManager.playBackgroundMusic();
                this.backgroundMusicPlaying = true;
            } else {
                // Ensure music is playing (in case it was paused)
                this.soundManager.resumeBackgroundMusic();
            }
        }
        
        const question = this.questions[this.currentQuestion];
        
        this.updateLifelineButtons();
        
        // Update session data for audience page using dataStore
        if (this.sessionId) {
            this.updateSessionData(question);
        }
        
        // Update question number
        document.getElementById('current-question').textContent =
            `Question ${this.currentQuestion + 1} of ${this.getGameQuestionCount()}`;
        
        // Update question text
        document.getElementById('question-text').innerHTML = this.renderMath(question.question);
        
        // Handle question image
        const imageContainer = document.getElementById('question-image-container');
        const questionImage = document.getElementById('question-image');
        
        if (question.image) {
            questionImage.src = question.image;
            imageContainer.style.display = 'block';
        } else {
            imageContainer.style.display = 'none';
        }
        
        // Update options
        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';
        
        question.options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option';
            optionElement.setAttribute('data-option', String.fromCharCode(65 + index));
            optionElement.innerHTML = `
                <span class="option-letter">${String.fromCharCode(65 + index)}</span>
                <span class="option-text">${this.renderMath(option)}</span>
            `;
            optionsContainer.appendChild(optionElement);
        });
        
        // Update prize ladder
        this.updatePrizeLadder();
    }
    
    // Select an option
    selectOption(optionElement) {
        if (!this.gameActive || this.processingAnswer) return;
        
        // Remove previous selections
        document.querySelectorAll('.option').forEach(opt => {
            opt.classList.remove('selected');
        });
        
        // Mark selected option
        optionElement.classList.add('selected');
        
        // Get the selected option index
        const optionIndex = Array.from(optionElement.parentNode.children).indexOf(optionElement);
        const question = this.questions[this.currentQuestion];
        
        // Check if answer is correct after brief feedback delay
        setTimeout(async () => {
            await this.checkAnswer(optionIndex, question);
        }, 1000);
    }
    
    // Check if answer is correct, show statistics, then advance
    async checkAnswer(selectedIndex, question) {
        if (this.processingAnswer) return;
        this.processingAnswer = true;
        
        const options = document.querySelectorAll('.option');
        const isCorrect = selectedIndex === question.correct;
        const answeredQuestionIndex = this.currentQuestion;
        
        // Mark correct answer
        options[question.correct].classList.add('correct');
        
        if (!isCorrect) {
            options[selectedIndex].classList.add('incorrect');
        }
        
        if (isCorrect) {
            this.score = this.prizeLadder[this.currentQuestion];
            await this.markHostAnswerResult(answeredQuestionIndex, true);
            await this.awardClassScoresOnHostCorrect(answeredQuestionIndex, question);
            await this.soundManager.playAndWait('correct');
        } else {
            this.soundManager.play('incorrect');
            await this.markHostAnswerResult(answeredQuestionIndex, false);
            await new Promise((resolve) => setTimeout(resolve, 1500));
        }
        
        // Show audience statistics for the question just answered
        await this.showStatisticsForAnsweredQuestion(answeredQuestionIndex, question);
        
        this.currentQuestion++;
        
        if (this.currentQuestion < this.getGameQuestionCount()) {
            this.loadQuestion();
        } else {
            this.endGame(true);
        }
        
        this.processingAnswer = false;
    }
    
    // Show statistics modal for a completed question; resolves when modal is closed
    async showStatisticsForAnsweredQuestion(questionIndex, question) {
        const sessionId = this.sessionId;
        const classScores = await this.calculateClassScores(sessionId);
        
        await this.showQuestionStatistics(question, questionIndex, sessionId, classScores);
        
        if (window.dataStore && window.dataStore.useFirebase && sessionId) {
            this.setupStatisticsListener(sessionId, questionIndex, question, classScores);
        }
        
        return new Promise((resolve) => {
            const modalElement = document.getElementById('lifelineModal');
            const onHidden = () => {
                modalElement.removeEventListener('hidden.bs.modal', onHidden);
                if (this.statisticsListener) {
                    this.statisticsListener();
                    this.statisticsListener = null;
                }
                resolve();
            };
            modalElement.addEventListener('hidden.bs.modal', onHidden);
        });
    }
    
    // Build empty score objects for every registered class
    buildEmptyClassTotals() {
        const totals = {};
        this.classes.forEach((className) => {
            totals[className] = { totalScore: 0, correctAnswers: 0, totalQuestions: 0 };
        });
        return totals;
    }
    
    // Firebase may return vote arrays as objects — normalize to [a,b,c,d]
    normalizeVoteArray(voteData) {
        if (!voteData) return null;
        if (Array.isArray(voteData) || typeof voteData === 'object') {
            return [0, 1, 2, 3].map((i) => parseInt(voteData[i], 10) || 0);
        }
        return null;
    }
    
    async loadClassTotals(sessionId) {
        const key = `gameSession_${sessionId}_classTotals`;
        if (window.dataStore) {
            const totals = await window.dataStore.get(key);
            return totals || {};
        }
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : {};
    }
    
    async saveClassTotals(sessionId, totals) {
        const key = `gameSession_${sessionId}_classTotals`;
        if (window.dataStore) {
            await window.dataStore.set(key, totals);
        } else {
            localStorage.setItem(key, JSON.stringify(totals));
        }
    }
    
    // Award class scores when host answers correctly (with topic-based weighting)
    async awardClassScoresOnHostCorrect(questionIndex, question) {
        if (!this.sessionId) return;
        if (!this.classes.length) await this.loadClasses();
        
        const sessionId = this.sessionId;
        const awardedKey = `gameSession_${sessionId}_scored_${questionIndex}`;
        
        let alreadyAwarded = false;
        if (window.dataStore) {
            alreadyAwarded = await window.dataStore.get(awardedKey);
        } else {
            alreadyAwarded = localStorage.getItem(awardedKey) === 'true';
        }
        if (alreadyAwarded) return;
        
        const prizeAmount = this.prizeLadder[questionIndex] || 0;
        const questionTopic = question.topic || '';
        const correctIndex = parseInt(question.correct, 10);
        const totals = await this.loadClassTotals(sessionId);
        
        this.classes.forEach((className) => {
            if (!totals[className]) {
                totals[className] = { totalScore: 0, correctAnswers: 0, totalQuestions: 0 };
            }
        });
        
        const classVotesKey = `gameSession_${sessionId}_classVotes_${questionIndex}`;
        let classVotes = null;
        if (window.dataStore) {
            classVotes = await window.dataStore.get(classVotesKey);
        } else {
            const stored = localStorage.getItem(classVotesKey);
            classVotes = stored ? JSON.parse(stored) : null;
        }
        
        const awardToClass = (className) => {
            const points = this.getClassScoreForQuestion(className, prizeAmount, questionTopic);
            totals[className].totalScore += points;
            totals[className].correctAnswers += 1;
            totals[className].totalQuestions += 1;
        };
        
        let awardedAnyClass = false;
        const voteClassNames = classVotes ? Object.keys(classVotes) : [];
        
        voteClassNames.forEach((className) => {
            const voteArray = this.normalizeVoteArray(classVotes[className]);
            if (!voteArray) return;
            if ((voteArray[correctIndex] || 0) > 0) {
                awardToClass(className);
                awardedAnyClass = true;
            }
        });
        
        // No audience votes yet — award all registered classes with topic weighting
        if (!awardedAnyClass) {
            this.classes.forEach((className) => awardToClass(className));
        }
        
        await this.saveClassTotals(sessionId, totals);
        if (window.dataStore) {
            await window.dataStore.set(awardedKey, true);
        } else {
            localStorage.setItem(awardedKey, 'true');
        }
        await this.syncClassScoresToStorage(sessionId);
    }
    
    // Record whether the host answered a question correctly
    async markHostAnswerResult(questionIndex, isCorrect) {
        if (!this.sessionId) return;
        const key = `gameSession_${this.sessionId}_hostCorrect_${questionIndex}`;
        if (window.dataStore) {
            await window.dataStore.set(key, isCorrect);
        } else {
            localStorage.setItem(key, isCorrect ? 'true' : 'false');
        }
    }
    
    // Read whether the host answered a question correctly
    async getHostAnswerResult(sessionId, questionIndex) {
        const key = `gameSession_${sessionId}_hostCorrect_${questionIndex}`;
        if (window.dataStore) {
            const value = await window.dataStore.get(key);
            return value === true || value === 'true';
        }
        return localStorage.getItem(key) === 'true';
    }
    
    // Persist calculated class totals so statistics and Firebase listeners stay in sync
    async syncClassScoresToStorage(sessionId) {
        if (!sessionId) return;
        const calculated = await this.calculateClassScores(sessionId);
        const scoresKey = `gameSession_${sessionId}_classScores`;
        const flatScores = {};
        Object.keys(calculated).forEach((className) => {
            flatScores[className] = calculated[className].totalScore;
        });
        if (window.dataStore) {
            await window.dataStore.set(scoresKey, flatScores);
        } else {
            localStorage.setItem(scoresKey, JSON.stringify(flatScores));
        }
    }
    
    // Award points to a class (legacy flat storage — prefer syncClassScoresToStorage)
    async awardClassPoints(className, points) {
        if (!this.sessionId) return;
        
        // Get current class scores from session using dataStore
        const scoresKey = `gameSession_${this.sessionId}_classScores`;
        let classScores = {};
        
        if (window.dataStore) {
            const storedScores = await window.dataStore.get(scoresKey);
            classScores = storedScores || {};
        } else {
            // Fallback to localStorage
            const storedScores = localStorage.getItem(scoresKey);
            if (storedScores) {
                classScores = JSON.parse(storedScores);
            }
        }
        
        // Initialize if not exists
        if (!classScores[className]) {
            classScores[className] = 0;
        }
        
        // Add points
        classScores[className] += points;
        
        // Save back using dataStore
        if (window.dataStore) {
            await window.dataStore.set(scoresKey, classScores);
        } else {
            localStorage.setItem(scoresKey, JSON.stringify(classScores));
        }
    }
    
    // Update session data for audience page
    async updateSessionData(question) {
        if (!this.sessionId) return;
        
        const questionData = {
            question: question.question,
            options: question.options,
            questionNumber: this.currentQuestion + 1,
            correct: question.correct,
            topic: question.topic || ''
        };
        
        if (window.dataStore) {
            await window.dataStore.set(`gameSession_${this.sessionId}_question`, this.currentQuestion.toString());
            await window.dataStore.set(`gameSession_${this.sessionId}_questionData`, questionData);
            await window.dataStore.set(`gameSession_${this.sessionId}_questionData_${this.currentQuestion}`, questionData);
            await window.dataStore.remove(`gameSession_${this.sessionId}_votes_${this.currentQuestion}`);
        } else {
            localStorage.setItem(`gameSession_${this.sessionId}_question`, this.currentQuestion.toString());
            localStorage.setItem(`gameSession_${this.sessionId}_questionData`, JSON.stringify(questionData));
            localStorage.setItem(`gameSession_${this.sessionId}_questionData_${this.currentQuestion}`, JSON.stringify(questionData));
            localStorage.removeItem(`gameSession_${this.sessionId}_votes_${this.currentQuestion}`);
        }
    }
    
    // Use a lifeline
    useLifeline(lifelineType) {
        if (!this.gameActive) return;
        
        // Check if this lifeline is still available for the game
        if (!this.lifelines[lifelineType]) {
            return;
        }
        
        this.soundManager.play('lifeline');
        
        // Mark lifeline as used for this game
        this.lifelines[lifelineType] = false;
        this.updateLifelineButtons();
        
        switch (lifelineType) {
            case '50-50':
                this.useFiftyFifty();
                break;
            case 'phone':
                this.usePhoneFriend();
                break;
            case 'audience':
                this.useAskAudience();
                break;
        }
    }
    
    // Update lifeline button states from this.lifelines
    updateLifelineButtons() {
        const buttonIds = {
            '50-50': 'fifty-fifty',
            'phone': 'phone-friend',
            'audience': 'ask-audience'
        };
        
        Object.entries(buttonIds).forEach(([lifelineType, buttonId]) => {
            const button = document.getElementById(buttonId);
            if (!button) return;
            
            const isAvailable = this.lifelines[lifelineType];
            if (isAvailable) {
                button.classList.remove('used');
                button.disabled = false;
            } else {
                button.classList.add('used');
                button.disabled = true;
            }
        });
    }
    
    // 50:50 lifeline - remove two wrong answers
    useFiftyFifty() {
        const question = this.questions[this.currentQuestion];
        const options = document.querySelectorAll('.option');
        const wrongOptions = [];
        
        // Find wrong options
        options.forEach((option, index) => {
            if (index !== question.correct) {
                wrongOptions.push(index);
            }
        });
        
        // Remove two random wrong options
        const toRemove = wrongOptions.sort(() => 0.5 - Math.random()).slice(0, 2);
        toRemove.forEach(index => {
            options[index].style.display = 'none';
        });
        
        this.showLifelineModal('50:50', 'Two wrong answers have been removed!');
    }
    
    // Phone a friend lifeline
    usePhoneFriend() {
        const question = this.questions[this.currentQuestion];
        const correctAnswer = question.options[question.correct];
        const friendResponse = `"I'm pretty confident the answer is ${correctAnswer}. I'd say about 85% sure!"`;
        
        this.showLifelineModal('Phone a Friend', `
            <div class="text-center">
                <i class="fas fa-phone fa-3x mb-3" style="color: #FFD700;"></i>
                <p><strong>Your friend says:</strong></p>
                <p class="fst-italic">${friendResponse}</p>
            </div>
        `);
    }
    
    // Ask the audience lifeline
    useAskAudience() {
        const question = this.questions[this.currentQuestion];
        const correctIndex = question.correct;
        
        // Try to get real audience votes from localStorage
        let results = [0, 0, 0, 0];
        const votesKey = `gameSession_${this.sessionId}_votes_${this.currentQuestion}`;
        const audienceVotes = localStorage.getItem(votesKey);
        
        if (audienceVotes && this.sessionId) {
            // Use real audience votes
            const votes = JSON.parse(audienceVotes);
            const totalVotes = votes.reduce((sum, count) => sum + count, 0);
            
            if (totalVotes > 0) {
                // Calculate percentages from real votes
                results = votes.map(count => Math.round((count / totalVotes) * 100));
                
                // Ensure total is 100%
                const total = results.reduce((sum, val) => sum + val, 0);
                if (total !== 100) {
                    const diff = 100 - total;
                    results[correctIndex] += diff; // Add difference to correct answer
                }
            } else {
                // No votes yet, use simulated results
                results = this.generateSimulatedAudienceResults(correctIndex);
            }
        } else {
            // No session or no votes, use simulated results
            results = this.generateSimulatedAudienceResults(correctIndex);
        }
        
        let audienceHTML = '<div class="text-center"><h6>Audience Poll Results:</h6>';
        if (audienceVotes && this.sessionId) {
            const votes = JSON.parse(audienceVotes);
            const totalVotes = votes.reduce((sum, count) => sum + count, 0);
            audienceHTML += `<p class="text-muted mb-3"><small>${totalVotes} audience member${totalVotes !== 1 ? 's' : ''} voted</small></p>`;
        }
        question.options.forEach((option, index) => {
            audienceHTML += `
                <div class="mb-2">
                    <div class="d-flex justify-content-between">
                        <span>${String.fromCharCode(65 + index)}: ${option}</span>
                        <span>${results[index]}%</span>
                    </div>
                    <div class="progress" style="height: 10px;">
                        <div class="progress-bar bg-warning" style="width: ${results[index]}%"></div>
                    </div>
                </div>
            `;
        });
        audienceHTML += '</div>';
        
        this.showLifelineModal('Ask the Audience', audienceHTML);
    }
    
    // Generate simulated audience results (fallback)
    generateSimulatedAudienceResults(correctIndex) {
        const results = [0, 0, 0, 0];
        results[correctIndex] = Math.floor(Math.random() * 20) + 60; // 60-80% for correct answer
        
        // Distribute remaining percentage among other options
        let remaining = 100 - results[correctIndex];
        for (let i = 0; i < 4; i++) {
            if (i !== correctIndex) {
                const percentage = Math.floor(Math.random() * remaining);
                results[i] = percentage;
                remaining -= percentage;
            }
        }
        
        // Ensure total is 100%
        if (remaining > 0) {
            results[correctIndex] += remaining;
        }
        
        return results;
    }
    
    // Show lifeline modal
    showLifelineModal(title, content) {
        const modalElement = document.getElementById('lifelineModal');
        const titleElement = document.getElementById('lifeline-title');
        const contentElement = document.getElementById('lifeline-content');
        
        // Set title and content
        titleElement.textContent = title;
        titleElement.style.fontSize = '1.5rem';
        titleElement.style.fontWeight = 'bold';
        contentElement.innerHTML = content;
        
        // Get or create modal instance
        if (!this.lifelineModalInstance) {
            this.lifelineModalInstance = new bootstrap.Modal(modalElement, {
                backdrop: true,
                keyboard: true,
                focus: true
            });
            
            // Clean up on modal hide
            modalElement.addEventListener('hidden.bs.modal', () => {
                // Clean up any lingering backdrop
                const backdrops = document.querySelectorAll('.modal-backdrop');
                backdrops.forEach(backdrop => backdrop.remove());
                
                // Remove modal-open class from body if it exists
                document.body.classList.remove('modal-open');
                document.body.style.overflow = '';
                document.body.style.paddingRight = '';
                
                // Clean up chart if it exists
                if (this.classScoreChart) {
                    this.classScoreChart.destroy();
                    this.classScoreChart = null;
                }
            }, { once: false });
        }
        
        // Show the modal
        this.lifelineModalInstance.show();
    }
    
    // Show statistics (similar to Ask the Audience, but can be clicked anytime)
    async showStatistics() {
        // Check if there's an active game session using dataStore
        let currentSession = null;
        if (window.dataStore) {
            currentSession = await window.dataStore.get('currentGameSession');
        } else {
            currentSession = localStorage.getItem('currentGameSession');
        }
        
        let questionIndex = -1;
        let question = null;
        
        if (currentSession && this.gameActive) {
            // If game is active, show stats for current question
            questionIndex = this.currentQuestion;
            question = this.questions[questionIndex];
        } else if (currentSession) {
            // If session exists but game not active, try to get the last question
            let lastQuestionIndex = null;
            let questionData = null;
            
            if (window.dataStore) {
                lastQuestionIndex = await window.dataStore.get(`gameSession_${currentSession}_question`);
                questionData = await window.dataStore.get(`gameSession_${currentSession}_questionData`);
            } else {
                lastQuestionIndex = localStorage.getItem(`gameSession_${currentSession}_question`);
                const questionDataStr = localStorage.getItem(`gameSession_${currentSession}_questionData`);
                if (questionDataStr) {
                    questionData = JSON.parse(questionDataStr);
                }
            }
            
            if (lastQuestionIndex !== null) {
                questionIndex = parseInt(lastQuestionIndex);
                if (questionData) {
                    question = {
                        question: questionData.question,
                        options: questionData.options,
                        correct: questionData.correct || null
                    };
                }
            }
        }
        
        // Calculate and show class scores
        const classScores = await this.calculateClassScores(currentSession);
        
        // If we have a question, show statistics for it
        if (question && questionIndex >= 0) {
            await this.showQuestionStatistics(question, questionIndex, currentSession, classScores);
            
            // Set up real-time listener for this question's votes if using Firebase
            if (window.dataStore && window.dataStore.useFirebase && currentSession) {
                this.setupStatisticsListener(currentSession, questionIndex, question, classScores);
            }
        } else {
            // No active question, but show class scores if available
            if (Object.keys(classScores).length > 0) {
                let statsHTML = '<div class="text-center"><h6>Class Scores</h6>';
                statsHTML += this.renderClassScores(classScores);
                statsHTML += '</div>';
                this.showLifelineModal('Statistics', statsHTML);
                
                // Set up real-time listener for class scores if using Firebase
                if (window.dataStore && window.dataStore.useFirebase && currentSession) {
                    this.setupClassScoresListener(currentSession);
                }
            } else {
                // No active question, show message
                this.showLifelineModal('Statistics', `
                    <div class="text-center">
                        <i class="fas fa-chart-bar fa-3x mb-3" style="color: #FFD700;"></i>
                        <p><strong>No active question found.</strong></p>
                        <p class="text-muted">Start a game to see audience voting statistics for questions.</p>
                    </div>
                `);
            }
        }
    }
    
    // Set up real-time listener for statistics updates
    setupStatisticsListener(sessionId, questionIndex, question, initialClassScores) {
        // Remove existing listener if any
        if (this.statisticsListener) {
            this.statisticsListener();
            this.statisticsListener = null;
        }
        
        // Listen for votes on this question (both general votes and class votes)
        const votesKey = `gameSession_${sessionId}_votes_${questionIndex}`;
        const classVotesKey = `gameSession_${sessionId}_classVotes_${questionIndex}`;
        
        // Create a combined listener function
        const updateStats = async () => {
            // Recalculate scores when votes change
            const updatedScores = await this.calculateClassScores(sessionId);
            // Update the statistics modal if it's still open
            const modal = document.getElementById('lifelineModal');
            if (modal && modal.classList.contains('show')) {
                await this.showQuestionStatistics(question, questionIndex, sessionId, updatedScores);
            }
        };
        
        // Listen to both vote keys
        if (window.dataStore && window.dataStore.useFirebase) {
            const unsubscribe1 = window.dataStore.on(votesKey, updateStats);
            const unsubscribe2 = window.dataStore.on(classVotesKey, updateStats);
            
            // Store both unsubscribe functions
            this.statisticsListener = () => {
                if (unsubscribe1) unsubscribe1();
                if (unsubscribe2) unsubscribe2();
            };
        }
    }
    
    // Set up real-time listener for class scores updates
    setupClassScoresListener(sessionId) {
        // Remove existing listener if any
        if (this.classScoresListener) {
            this.classScoresListener();
            this.classScoresListener = null;
        }
        
        // Listen for class scores changes
        const scoresKey = `gameSession_${sessionId}_classScores`;
        this.classScoresListener = window.dataStore.on(scoresKey, async (scores) => {
            // Recalculate all scores when host scores change
            const updatedScores = await this.calculateClassScores(sessionId);
            // Update the statistics modal if it's still open
            const modal = document.getElementById('lifelineModal');
            if (modal && modal.classList.contains('show')) {
                let statsHTML = '<div class="text-center"><h6>Class Scores</h6>';
                statsHTML += this.renderClassScores(updatedScores);
                statsHTML += '</div>';
                document.getElementById('lifeline-content').innerHTML = statsHTML;
            }
        });
        
        // Also listen for votes on all questions
        for (let qIndex = 0; qIndex < this.prizeLadder.length; qIndex++) {
            const votesKey = `gameSession_${sessionId}_classVotes_${qIndex}`;
            window.dataStore.on(votesKey, async () => {
                // Recalculate all scores when any vote changes
                const updatedScores = await this.calculateClassScores(sessionId);
                const modal = document.getElementById('lifelineModal');
                if (modal && modal.classList.contains('show')) {
                    let statsHTML = '<div class="text-center"><h6>Class Scores</h6>';
                    statsHTML += this.renderClassScores(updatedScores);
                    statsHTML += '</div>';
                    document.getElementById('lifeline-content').innerHTML = statsHTML;
                }
            });
        }
    }
    
    // Return persisted class scores for display
    async calculateClassScores(sessionId) {
        if (!sessionId) return {};
        
        const totals = await this.loadClassTotals(sessionId);
        let classes = this.classes;
        
        if (!classes.length) {
            if (window.dataStore) {
                const stored = await window.dataStore.get('mathMillionaireClasses');
                if (stored && Array.isArray(stored)) classes = stored;
            } else {
                const localStored = localStorage.getItem('mathMillionaireClasses');
                if (localStored) classes = JSON.parse(localStored);
            }
        }
        
        classes.forEach((className) => {
            if (!totals[className]) {
                totals[className] = { totalScore: 0, correctAnswers: 0, totalQuestions: 0 };
            }
        });
        
        return totals;
    }
    
    // Render class scores in a leaderboard format with bar chart
    renderClassScores(classScores) {
        if (Object.keys(classScores).length === 0) {
            return '<p class="text-muted">No class scores available yet.</p>';
        }
        
        // Sort classes by score (descending)
        const sortedClasses = Object.keys(classScores).sort((a, b) => {
            return classScores[b].totalScore - classScores[a].totalScore;
        });
        
        // Generate unique ID for chart canvas
        const chartId = 'classScoresChart_' + Date.now();
        
        let html = '<div class="mb-4">';
        html += '<h5 class="mb-3 fw-bold">Class Scores Bar Chart</h5>';
        html += `<div style="height: 500px; width: 100%;"><canvas id="${chartId}"></canvas></div>`;
        html += '</div>';
        
        html += '<hr class="my-4">';
        html += '<h5 class="mb-3 fw-bold">Class Scores Leaderboard</h5>';
        html += '<div class="table-responsive"><table class="table table-striped table-hover" style="font-size: 1.1rem;">';
        html += '<thead class="table-dark"><tr>';
        html += '<th style="font-size: 1.2rem; font-weight: bold;">Rank</th><th style="font-size: 1.2rem; font-weight: bold;">Class</th><th style="font-size: 1.2rem; font-weight: bold;">Score</th><th style="font-size: 1.2rem; font-weight: bold;">Correct</th>';
        html += '</tr></thead><tbody>';
        
        sortedClasses.forEach((className, index) => {
            const score = classScores[className];
            const rank = index + 1;
            const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '';
            
            html += `<tr ${rank <= 3 ? 'class="table-warning"' : ''}>`;
            html += `<td><strong>${medal} ${rank}</strong></td>`;
            html += `<td><strong>${this.escapeHtml(className)}</strong></td>`;
            html += `<td><strong class="text-success">${score.totalScore.toLocaleString()}</strong></td>`;
            html += `<td>${score.correctAnswers}</td>`;
            html += '</tr>';
        });
        
        html += '</tbody></table></div>';
        
        // Store chart data for rendering after modal is shown
        setTimeout(() => {
            this.renderBarChart(chartId, sortedClasses, classScores);
        }, 100);
        
        return html;
    }
    
    // Render bar chart for class scores
    renderBarChart(canvasId, sortedClasses, classScores) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        // Destroy existing chart if it exists
        if (this.classScoreChart) {
            this.classScoreChart.destroy();
        }
        
        // Prepare data
        const labels = sortedClasses.map(className => this.escapeHtml(className));
        const scores = sortedClasses.map(className => classScores[className].totalScore);
        
        // Generate colors - gold for top 3, blue for others
        const backgroundColors = sortedClasses.map((className, index) => {
            if (index === 0) return 'rgba(255, 215, 0, 0.8)'; // Gold
            if (index === 1) return 'rgba(192, 192, 192, 0.8)'; // Silver
            if (index === 2) return 'rgba(205, 127, 50, 0.8)'; // Bronze
            return 'rgba(13, 110, 253, 0.8)'; // Blue
        });
        
        const borderColors = sortedClasses.map((className, index) => {
            if (index === 0) return 'rgba(255, 215, 0, 1)'; // Gold
            if (index === 1) return 'rgba(192, 192, 192, 1)'; // Silver
            if (index === 2) return 'rgba(205, 127, 50, 1)'; // Bronze
            return 'rgba(13, 110, 253, 1)'; // Blue
        });
        
        // Create chart
        const ctx = canvas.getContext('2d');
        this.classScoreChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Class Scores',
                    data: scores,
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#FFD700',
                        borderWidth: 2,
                        padding: 12,
                        titleFont: {
                            size: 16,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 14
                        },
                        callbacks: {
                            label: function(context) {
                                return 'Score: ' + context.parsed.y.toLocaleString();
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: '#ffffff',
                            font: {
                                size: 14,
                                weight: 'bold'
                            },
                            callback: function(value) {
                                return value.toLocaleString();
                            }
                        },
                        title: {
                            display: true,
                            text: 'Score',
                            color: '#ffffff',
                            font: {
                                size: 16,
                                weight: 'bold'
                            }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.3)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Class',
                            color: '#ffffff',
                            font: {
                                size: 16,
                                weight: 'bold'
                            }
                        },
                        ticks: {
                            color: '#ffffff',
                            font: {
                                size: 14,
                                weight: 'bold'
                            },
                            maxRotation: 45,
                            minRotation: 0
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.3)'
                        }
                    }
                }
            }
        });
    }
    
    // Show statistics for a specific question
    async showQuestionStatistics(question, questionIndex, sessionId, classScores = {}) {
        let results = [0, 0, 0, 0];
        const votesKey = `gameSession_${sessionId}_votes_${questionIndex}`;
        let audienceVotes = null;
        
        // Get votes using dataStore
        if (window.dataStore) {
            audienceVotes = await window.dataStore.get(votesKey);
        } else {
            const localStored = localStorage.getItem(votesKey);
            if (localStored) {
                audienceVotes = JSON.parse(localStored);
            }
        }
        
        // Get class-specific votes if available using dataStore
        const classVotesKey = `gameSession_${sessionId}_classVotes_${questionIndex}`;
        let classVotes = {};
        
        if (window.dataStore) {
            const classVotesData = await window.dataStore.get(classVotesKey);
            if (classVotesData) {
                classVotes = classVotesData;
            }
        } else {
            const classVotesData = localStorage.getItem(classVotesKey);
            if (classVotesData) {
                classVotes = JSON.parse(classVotesData);
            }
        }
        
        if (audienceVotes && sessionId) {
            // Use real audience votes (already parsed if from dataStore)
            const votes = Array.isArray(audienceVotes) ? audienceVotes : JSON.parse(audienceVotes);
            const totalVotes = votes.reduce((sum, count) => sum + count, 0);
            
            if (totalVotes > 0) {
                // Calculate percentages from real votes
                results = votes.map(count => Math.round((count / totalVotes) * 100));
                
                // Ensure total is 100%
                const total = results.reduce((sum, val) => sum + val, 0);
                if (total !== 100) {
                    const diff = 100 - total;
                    // Distribute difference to the option with most votes
                    const maxIndex = results.indexOf(Math.max(...results));
                    results[maxIndex] += diff;
                }
            } else {
                // No votes yet
                results = [0, 0, 0, 0];
            }
        }
        
        let statsHTML = '<div class="text-center"><h4 class="mb-4 fw-bold">Audience Voting Statistics</h4>';
        
        if (audienceVotes && sessionId) {
            const votes = Array.isArray(audienceVotes) ? audienceVotes : JSON.parse(audienceVotes);
            const totalVotes = votes.reduce((sum, count) => sum + count, 0);
            statsHTML += `<p class="mb-4" style="font-size: 1.2rem;"><strong>${totalVotes} audience member${totalVotes !== 1 ? 's' : ''} voted</strong></p>`;
            
            // Show class breakdown if available
            if (Object.keys(classVotes).length > 0) {
                statsHTML += '<div class="mb-4"><h5 class="mb-3">Votes by Class:</h5>';
                Object.keys(classVotes).forEach(className => {
                    const classVoteArray = this.normalizeVoteArray(classVotes[className]);
                    if (!classVoteArray) return;
                    const classTotal = classVoteArray.reduce((sum, count) => sum + count, 0);
                    if (classTotal > 0) {
                        statsHTML += `<div class="mb-2" style="font-size: 1.1rem;">
                            <strong>${this.escapeHtml(className)}:</strong> ${classTotal} vote${classTotal !== 1 ? 's' : ''}
                        </div>`;
                    }
                });
                statsHTML += '</div>';
            }
        } else {
            statsHTML += `<p class="text-muted mb-4" style="font-size: 1.1rem;">No votes recorded yet.</p>`;
        }
        
        // Show voting results
        question.options.forEach((option, index) => {
            const votes = Array.isArray(audienceVotes) ? audienceVotes : (audienceVotes ? JSON.parse(audienceVotes) : [0, 0, 0, 0]);
            const voteCount = votes[index] || 0;
            statsHTML += `
                <div class="mb-4">
                    <div class="d-flex justify-content-between align-items-center mb-2" style="font-size: 1.1rem;">
                        <span><strong>${String.fromCharCode(65 + index)}:</strong> ${this.renderMath(option)}</span>
                        <span><strong style="font-size: 1.2rem;">${results[index]}%</strong> <span style="font-size: 1rem;">(${voteCount} vote${voteCount !== 1 ? 's' : ''})</span></span>
                    </div>
                    <div class="progress" style="height: 30px;">
                        <div class="progress-bar ${results[index] > 0 ? 'bg-warning' : 'bg-secondary'}" 
                             style="width: ${results[index]}%; font-size: 1rem; font-weight: bold; line-height: 30px;" 
                             role="progressbar">
                            ${results[index]}%
                        </div>
                    </div>
                </div>
            `;
        });
        statsHTML += '</div>';
        
        // Add class scores section
        if (Object.keys(classScores).length > 0) {
            statsHTML += '<hr class="my-4">';
            statsHTML += '<h6 class="mb-3">Class Scores (Based on Prize Ladder)</h6>';
            statsHTML += this.renderClassScores(classScores);
        }
        
        this.showLifelineModal('Statistics', statsHTML);
    }
    
    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Update prize ladder
    updatePrizeLadder() {
        const ladderItems = document.querySelectorAll('.ladder-item');
        ladderItems.forEach((item, index) => {
            item.classList.remove('current', 'passed');
            if (index === this.currentQuestion) {
                item.classList.add('current');
            } else if (index < this.currentQuestion) {
                item.classList.add('passed');
            }
        });
    }
    
    // Next question
    nextQuestion() {
        this.loadQuestion();
        document.getElementById('next-question').style.display = 'none';
    }
    
    // End game
    async endGame(won) {
        this.gameActive = false;
        
        // Stop background music when game ends
        this.soundManager.stopBackgroundMusic();
        this.backgroundMusicPlaying = false;
        
        // Hide QR code corner when game ends
        const qrCornerDisplay = document.getElementById('qr-code-corner');
        if (qrCornerDisplay) {
            qrCornerDisplay.style.display = 'none';
        }
        
        // Play appropriate sound
        if (won) {
            this.soundManager.play('applause');
        } else {
            this.soundManager.play('gameOver');
        }
        
        const modal = new bootstrap.Modal(document.getElementById('gameOverModal'));
        const messageElement = document.getElementById('game-over-message');
        const scoreElement = document.getElementById('final-score');
        const statisticsElement = document.getElementById('game-over-statistics');
        
        // Clear previous messages and statistics
        messageElement.innerHTML = '';
        scoreElement.innerHTML = '';
        statisticsElement.innerHTML = '';
        
        // Get current session ID
        let currentSession = null;
        if (window.dataStore) {
            currentSession = await window.dataStore.get('currentGameSession');
        } else {
            currentSession = localStorage.getItem('currentGameSession');
        }
        
        // Display statistics if session exists
        if (currentSession) {
            // Calculate class scores
            const classScores = await this.calculateClassScores(currentSession);
            
            // Build statistics HTML
            let statsHTML = '';
            
            // Add class scores section first
            if (Object.keys(classScores).length > 0) {
                // Determine winning class (highest score)
                const sortedClasses = Object.keys(classScores).sort((a, b) => {
                    return classScores[b].totalScore - classScores[a].totalScore;
                });
                
                const winningClass = sortedClasses[0];
                const winningScore = classScores[winningClass].totalScore;
                
                // Display winning message
                statsHTML += '<div class="text-center mb-4">';
                statsHTML += `<h3 class="text-success mb-3"><i class="fas fa-trophy"></i> Winner: ${this.escapeHtml(winningClass)}</h3>`;
                statsHTML += `<p class="h5 mb-4"><strong>Highest Score: ${winningScore.toLocaleString()}</strong></p>`;
                statsHTML += '</div>';
                
                statsHTML += '<hr class="my-4">';
                statsHTML += this.renderClassScores(classScores);
            } else {
                statsHTML += '<p class="text-muted text-center">No class scores available yet.</p>';
            }
            
            statisticsElement.innerHTML = statsHTML;
            
            // Ensure chart renders after modal is fully shown
            // renderClassScores already has a setTimeout, but we need to wait for modal to be visible
            setTimeout(() => {
                const chartCanvas = statisticsElement.querySelector('canvas');
                if (chartCanvas && Object.keys(classScores).length > 0) {
                    const sortedClasses = Object.keys(classScores).sort((a, b) => {
                        return classScores[b].totalScore - classScores[a].totalScore;
                    });
                    // Destroy any existing chart first
                    if (this.classScoreChart) {
                        this.classScoreChart.destroy();
                        this.classScoreChart = null;
                    }
                    this.renderBarChart(chartCanvas.id, sortedClasses, classScores);
                }
            }, 500);
        }
        
        modal.show();
        
        document.getElementById('quit-game').style.display = 'none';
    }
    
    // Quit game
    quitGame() {
        if (confirm('Are you sure you want to quit? You will lose your current progress.')) {
            this.endGame(false);
        }
    }
    
    // Reset game
    resetGame() {
        this.currentQuestion = 0;
        this.score = 0;
        this.gameActive = false;
        this.sessionId = null;
        this.processingAnswer = false;
        this.resetLifelines();
        this.updatePrizeLadder();
        this.showStartScreen();
        
        // Stop background music
        this.soundManager.stopBackgroundMusic();
        this.backgroundMusicPlaying = false;
        
        // Hide music controls
        const musicControls = document.getElementById('music-controls');
        if (musicControls) {
            musicControls.style.display = 'none';
        }
        
        // Hide QR code corner
        const qrCornerDisplay = document.getElementById('qr-code-corner');
        if (qrCornerDisplay) {
            qrCornerDisplay.style.display = 'none';
        }
        
        // Clear session data
        if (this.sessionId) {
            if (window.dataStore) {
                window.dataStore.remove(`gameSession_${this.sessionId}_active`);
                window.dataStore.remove('currentGameSession');
            } else {
                localStorage.removeItem(`gameSession_${this.sessionId}_active`);
                localStorage.removeItem('currentGameSession');
            }
        }
        
        // Reset options display
        document.querySelectorAll('.option').forEach(option => {
            option.style.display = 'block';
            option.classList.remove('selected', 'correct', 'incorrect');
        });
    }
    
    // Reset lifelines for a new game
    resetLifelines() {
        this.lifelines = {
            '50-50': true,
            'phone': true,
            'audience': true
        };
        
        this.updateLifelineButtons();
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new MathMillionaireGame();
});

// Sound Manager for game audio effects
class SoundManager {
    constructor() {
        this.sounds = {
            correct: new Audio('sounds/Correct.mp3'),
            incorrect: new Audio('sounds/incorrect.mp3'),
            lifeline: new Audio('sounds/lifeline.mp3'),
            applause: new Audio('sounds/applause.mp3'),
            gameStart: new Audio('sounds/gameStart.mp3'),
            gameOver: new Audio('sounds/gameOver.mp3'),
            startQuestion: new Audio('sounds/Start Question.mp3')
        };
        
        // Set volume levels
        this.sounds.correct.volume = 0.7;
        this.sounds.incorrect.volume = 0.7;
        this.sounds.lifeline.volume = 0.6;
        this.sounds.applause.volume = 0.8;
        this.sounds.gameStart.volume = 0.6;
        this.sounds.gameOver.volume = 0.7;
        this.sounds.startQuestion.volume = 0.7;
        
        // Background music (separate from sound effects)
        this.backgroundMusic = new Audio('sounds/background music 1.mp3');
        this.backgroundMusic.loop = true; // Loop the background music continuously
        this.backgroundMusic.volume = 0.5; // Default volume (50%)
        this.isMusicMuted = false;
        this.musicVolume = 0.5; // Store volume level (0.0 to 1.0)
        
        // Preload the background music
        this.backgroundMusic.load();
        
        // Set up background music controls
        this.setupMusicControls();
    }
    
    play(soundName) {
        if (this.sounds[soundName]) {
            // Reset audio to beginning
            this.sounds[soundName].currentTime = 0;
            
            // Play the sound
            this.sounds[soundName].play().catch(e => {
                console.log('Sound not available:', soundName, e);
                // Fallback: try to play without error handling
                try {
                    this.sounds[soundName].play();
                } catch (fallbackError) {
                    console.log('Audio playback failed:', fallbackError);
                }
            });
        }
    }
    
    // Play sound and return a promise that resolves when the sound finishes
    playAndWait(soundName) {
        return new Promise((resolve) => {
            if (this.sounds[soundName]) {
                // Reset audio to beginning
                this.sounds[soundName].currentTime = 0;
                
                // Set up event listener for when sound ends
                const onEnded = () => {
                    this.sounds[soundName].removeEventListener('ended', onEnded);
                    resolve();
                };
                
                this.sounds[soundName].addEventListener('ended', onEnded);
                
                // Play the sound
                this.sounds[soundName].play().catch(e => {
                    console.log('Sound not available:', soundName, e);
                    // If play fails, resolve immediately
                    this.sounds[soundName].removeEventListener('ended', onEnded);
                    resolve();
                });
            } else {
                // If sound doesn't exist, resolve immediately
                resolve();
            }
        });
    }
    
    // Stop all sounds
    stopAll() {
        Object.values(this.sounds).forEach(sound => {
            sound.pause();
            sound.currentTime = 0;
        });
    }
    
    // Set master volume
    setVolume(volume) {
        Object.values(this.sounds).forEach(sound => {
            sound.volume = volume;
        });
    }
    
    // Setup background music controls
    setupMusicControls() {
        // Mute/Unmute button
        const muteBtn = document.getElementById('music-mute-btn');
        const muteIcon = document.getElementById('music-mute-icon');
        
        if (muteBtn) {
            muteBtn.addEventListener('click', () => {
                this.toggleMusicMute();
                // Update icon
                if (muteIcon) {
                    muteIcon.className = this.isMusicMuted ? 'fas fa-volume-mute' : 'fas fa-volume-up';
                }
            });
        }
        
        // Volume slider
        const volumeSlider = document.getElementById('music-volume');
        const volumeValue = document.getElementById('music-volume-value');
        
        if (volumeSlider) {
            // Set initial volume display
            if (volumeValue) {
                volumeValue.textContent = Math.round(this.musicVolume * 100) + '%';
            }
            volumeSlider.value = Math.round(this.musicVolume * 100);
            
            volumeSlider.addEventListener('input', (e) => {
                const volume = parseInt(e.target.value) / 100; // Convert 0-100 to 0.0-1.0
                this.setMusicVolume(volume);
                if (volumeValue) {
                    volumeValue.textContent = e.target.value + '%';
                }
                // Unmute if volume is increased from 0
                if (volume > 0 && this.isMusicMuted) {
                    this.isMusicMuted = false;
                    if (muteIcon) {
                        muteIcon.className = 'fas fa-volume-up';
                    }
                }
            });
        }
    }
    
    // Play background music
    playBackgroundMusic() {
        if (this.backgroundMusic && !this.isMusicMuted) {
            this.backgroundMusic.play().catch(e => {
                console.log('Background music playback failed:', e);
            });
        }
    }
    
    // Resume background music (if it was paused)
    resumeBackgroundMusic() {
        if (this.backgroundMusic && !this.isMusicMuted && this.backgroundMusic.paused) {
            this.backgroundMusic.play().catch(e => {
                console.log('Background music resume failed:', e);
            });
        }
    }
    
    // Stop background music
    stopBackgroundMusic() {
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
            this.backgroundMusic.currentTime = 0;
        }
    }
    
    // Toggle mute/unmute background music
    toggleMusicMute() {
        this.isMusicMuted = !this.isMusicMuted;
        if (this.backgroundMusic) {
            if (this.isMusicMuted) {
                this.backgroundMusic.pause();
            } else {
                this.backgroundMusic.play().catch(e => {
                    console.log('Background music playback failed:', e);
                });
            }
        }
    }
    
    // Set background music volume (0.0 to 1.0)
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume)); // Clamp between 0 and 1
        if (this.backgroundMusic) {
            this.backgroundMusic.volume = this.musicVolume;
        }
    }
}

// Add renderMath method to MathMillionaireGame class
MathMillionaireGame.prototype.renderMath = function(text) {
    if (!text) return '';
    
    // Convert common math symbols to LaTeX
    let processedText = text
        // Square root
        .replace(/√(\w+)/g, '\\sqrt{$1}')
        .replace(/√\(([^)]+)\)/g, '\\sqrt{$1}')
        // Powers
        .replace(/(\w+)\^(\w+)/g, '$1^{$2}')
        .replace(/(\w+)\^(\d+)/g, '$1^{$2}')
        // Fractions
        .replace(/(\d+)\/(\d+)/g, '\\frac{$1}{$2}')
        // Greek letters
        .replace(/π/g, '\\pi')
        .replace(/α/g, '\\alpha')
        .replace(/β/g, '\\beta')
        .replace(/γ/g, '\\gamma')
        .replace(/δ/g, '\\delta')
        .replace(/θ/g, '\\theta')
        .replace(/λ/g, '\\lambda')
        .replace(/μ/g, '\\mu')
        .replace(/σ/g, '\\sigma')
        .replace(/φ/g, '\\phi')
        .replace(/ω/g, '\\omega')
        // Math operators
        .replace(/±/g, '\\pm')
        .replace(/≠/g, '\\neq')
        .replace(/≤/g, '\\leq')
        .replace(/≥/g, '\\geq')
        .replace(/∞/g, '\\infty')
        .replace(/∑/g, '\\sum')
        .replace(/∫/g, '\\int')
        .replace(/∂/g, '\\partial')
        // Subscripts
        .replace(/(\w+)_(\w+)/g, '$1_{$2}')
        .replace(/(\w+)_(\d+)/g, '$1_{$2}');
    
    // Wrap in math delimiters if it contains LaTeX
    if (processedText.includes('\\')) {
        return `$${processedText}$`;
    }
    
    return text;
};
