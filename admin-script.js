// Math Millionaire Admin Panel Script
class QuestionManager {
    constructor() {
        this.questions = [];
        this.topics = [];
        this.classes = []; // Array to store class names
        this.editingIndex = -1;
        this.currentEditingImage = null;
        this.defaultQuestions = this.getDefaultQuestions();
        
        this.initializeAdmin();
    }
    
    // Initialize the admin panel
    async initializeAdmin() {
        this.loadQuestions();
        this.loadTopics();
        await this.loadClasses(); // Load classes from Firebase/localStorage
        this.bindEvents();
        this.renderQuestions();
        this.renderClasses(); // Render classes list
        this.updateQuestionCount();
        this.updateClassCount(); // Update class count badge
        this.updateTopicSelects();
        
        // Ensure tab switching works properly
        this.setupTabs();
        
        // Force render classes content immediately
        setTimeout(() => {
            this.renderClasses();
            this.updateClassCount();
        }, 200);
    }
    
    // Setup tab event listeners to ensure content is visible
    setupTabs() {
        // Listen for tab changes
        const tabButtons = document.querySelectorAll('#adminTabs button[data-bs-toggle="tab"]');
        tabButtons.forEach(button => {
            button.addEventListener('shown.bs.tab', (e) => {
                // When Classes tab is shown, ensure content is rendered
                if (e.target.id === 'classes-tab') {
                    this.renderClasses();
                    this.updateClassCount();
                    // Force visibility
                    const classesPane = document.getElementById('classes-pane');
                    if (classesPane) {
                        classesPane.classList.add('show', 'active');
                        classesPane.style.display = 'block';
                        classesPane.style.visibility = 'visible';
                        classesPane.style.opacity = '1';
                    }
                }
            });
            
            // Also listen for click events as a fallback
            button.addEventListener('click', (e) => {
                if (e.target.id === 'classes-tab' || e.target.closest('#classes-tab')) {
                    setTimeout(() => {
                        const classesPane = document.getElementById('classes-pane');
                        if (classesPane) {
                            classesPane.classList.add('show', 'active');
                            classesPane.style.display = 'block';
                            classesPane.style.visibility = 'visible';
                            classesPane.style.opacity = '1';
                            this.renderClasses();
                            this.updateClassCount();
                        }
                    }, 100);
                }
            });
        });
        
        // Initial check - if classes tab is somehow active, show content
        const classesTab = document.getElementById('classes-tab');
        if (classesTab && classesTab.classList.contains('active')) {
            const classesPane = document.getElementById('classes-pane');
            if (classesPane) {
                classesPane.classList.add('show', 'active');
                classesPane.style.display = 'block';
            }
        }
        
        // Debug: Verify elements exist
        setTimeout(() => {
            const classesPane = document.getElementById('classes-pane');
            const classForm = document.getElementById('class-form');
            const classNameInput = document.getElementById('class-name');
            
            console.log('Classes Pane exists:', !!classesPane);
            console.log('Class Form exists:', !!classForm);
            console.log('Class Name Input exists:', !!classNameInput);
            
            if (classesPane) {
                console.log('Classes Pane display:', window.getComputedStyle(classesPane).display);
                console.log('Classes Pane visibility:', window.getComputedStyle(classesPane).visibility);
            }
        }, 500);
    }
    
    // Bind event listeners
    bindEvents() {
        // Form submission
        document.getElementById('question-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveQuestion();
        });
        
        // Clear form
        document.getElementById('clear-form').addEventListener('click', () => {
            this.clearForm();
        });
        
        // Quick actions
        document.getElementById('load-default-questions').addEventListener('click', () => {
            this.loadDefaultQuestions();
        });
        
        document.getElementById('clear-all-questions').addEventListener('click', () => {
            this.clearAllQuestions();
        });
        
        document.getElementById('preview-game').addEventListener('click', () => {
            this.previewGame();
        });
        
        // Search and filter
        document.getElementById('search-questions').addEventListener('input', () => {
            this.filterQuestions();
        });
        
        document.getElementById('filter-topic').addEventListener('change', () => {
            this.filterQuestions();
        });
        
        document.getElementById('sort-questions').addEventListener('click', () => {
            this.sortQuestions();
        });
        
        // Topic management
        document.getElementById('add-topic-btn').addEventListener('click', () => {
            this.showAddTopicModal();
        });
        
        document.getElementById('save-topic').addEventListener('click', () => {
            this.saveTopic();
        });
        
        // Image handling
        document.getElementById('question-image').addEventListener('change', (e) => {
            this.handleImageUpload(e);
        });
        
        document.getElementById('remove-image').addEventListener('click', () => {
            this.removeImage();
        });
        
        // Math symbol buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('math-btn')) {
                this.insertMathSymbol(e.target.dataset.symbol, 'question-text');
            } else if (e.target.classList.contains('math-btn-small')) {
                const target = e.target.dataset.target;
                this.insertMathSymbol(e.target.dataset.symbol, target);
            }
        });
        
        // Import/Export
        document.getElementById('export-questions').addEventListener('click', () => {
            this.exportQuestions();
        });
        
        document.getElementById('import-questions').addEventListener('click', () => {
            this.showImportModal();
        });
        
        document.getElementById('confirm-import').addEventListener('click', () => {
            this.importQuestions();
        });
        
        // Class management events
        const classForm = document.getElementById('class-form');
        if (classForm) {
            classForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addClass();
            });
        } else {
            console.error('Class form not found');
        }
    }
    
    // Get default questions
    getDefaultQuestions() {
        return [
            {
                question: "What is 15 + 27?",
                options: ["42", "41", "43", "40"],
                correct: 0,
                topic: "Arithmetic",
                explanation: "15 + 27 = 42"
            },
            {
                question: "What is 8 × 7?",
                options: ["54", "56", "58", "60"],
                correct: 1,
                topic: "Arithmetic",
                explanation: "8 × 7 = 56"
            },
            {
                question: "What is 144 ÷ 12?",
                options: ["10", "11", "12", "13"],
                correct: 2,
                topic: "Arithmetic",
                explanation: "144 ÷ 12 = 12"
            },
            {
                question: "What is 5² + 3²?",
                options: ["32", "34", "36", "38"],
                correct: 1,
                topic: "Algebra",
                explanation: "5² + 3² = 25 + 9 = 34"
            },
            {
                question: "What is √64?",
                options: ["6", "7", "8", "9"],
                correct: 2,
                topic: "Algebra",
                explanation: "√64 = 8 (since 8 × 8 = 64)"
            },
            {
                question: "What is 2³ × 3²?",
                options: ["70", "72", "74", "76"],
                correct: 1,
                topic: "Algebra",
                explanation: "2³ × 3² = 8 × 9 = 72"
            },
            {
                question: "What is 15% of 200?",
                options: ["25", "30", "35", "40"],
                correct: 1,
                topic: "Percentages",
                explanation: "15% of 200 = 0.15 × 200 = 30"
            },
            {
                question: "What is the area of a circle with radius 7? (π ≈ 3.14)",
                options: ["147.86", "153.86", "159.86", "165.86"],
                correct: 1,
                topic: "Geometry",
                explanation: "Area = πr² = 3.14 × 7² = 3.14 × 49 = 153.86"
            },
            {
                question: "What is 3x + 5 = 20, find x?",
                options: ["3", "4", "5", "6"],
                correct: 2,
                topic: "Algebra",
                explanation: "3x + 5 = 20, so 3x = 15, therefore x = 5"
            },
            {
                question: "What is the derivative of x²?",
                options: ["x", "2x", "x²", "2x²"],
                correct: 1,
                topic: "Calculus",
                explanation: "The derivative of x² is 2x using the power rule"
            },
            {
                question: "What is ∫(2x + 3)dx?",
                options: ["x² + 3x + C", "2x² + 3x + C", "x² + 6x + C", "2x² + 6x + C"],
                correct: 0,
                topic: "Calculus",
                explanation: "∫(2x + 3)dx = x² + 3x + C"
            },
            {
                question: "What is the limit of (x² - 4)/(x - 2) as x approaches 2?",
                options: ["2", "3", "4", "5"],
                correct: 2,
                topic: "Calculus",
                explanation: "Using L'Hôpital's rule or factoring: (x² - 4)/(x - 2) = (x + 2), so limit is 4"
            },
            {
                question: "What is the determinant of [[2,3],[4,5]]?",
                options: ["-2", "-1", "1", "2"],
                correct: 0,
                topic: "Linear Algebra",
                explanation: "det = (2×5) - (3×4) = 10 - 12 = -2"
            },
            {
                question: "What is the sum of the first 10 natural numbers?",
                options: ["50", "55", "60", "65"],
                correct: 1,
                topic: "Sequences",
                explanation: "Sum = n(n+1)/2 = 10(11)/2 = 55"
            },
            {
                question: "What is the probability of rolling a 6 on a fair die?",
                options: ["1/3", "1/4", "1/5", "1/6"],
                correct: 3,
                topic: "Probability",
                explanation: "There is 1 favorable outcome out of 6 possible outcomes, so 1/6"
            }
        ];
    }
    
    // Save question to localStorage and update display
    async saveQuestion() {
        const formData = await this.getFormDataAsync();
        
        if (this.editingIndex >= 0) {
            // Update existing question
            this.questions[this.editingIndex] = formData;
            this.showMessage('Question updated successfully!', 'success');
        } else {
            // Add new question
            this.questions.push(formData);
            this.showMessage('Question added successfully!', 'success');
        }
        
        this.saveQuestions();
        this.renderQuestions();
        this.updateQuestionCount();
        this.clearForm();
    }
    
    // Get form data (async version for image handling)
    async getFormDataAsync() {
        const imageData = await this.getImageData();
        return {
            question: document.getElementById('question-text').value.trim(),
            options: [
                document.getElementById('option-a').value.trim(),
                document.getElementById('option-b').value.trim(),
                document.getElementById('option-c').value.trim(),
                document.getElementById('option-d').value.trim()
            ],
            correct: parseInt(document.getElementById('correct-answer').value),
            topic: document.getElementById('topic').value.trim(),
            explanation: document.getElementById('explanation').value.trim(),
            image: imageData
        };
    }
    
    // Get form data (sync version)
    getFormData() {
        return {
            question: document.getElementById('question-text').value.trim(),
            options: [
                document.getElementById('option-a').value.trim(),
                document.getElementById('option-b').value.trim(),
                document.getElementById('option-c').value.trim(),
                document.getElementById('option-d').value.trim()
            ],
            correct: parseInt(document.getElementById('correct-answer').value),
            topic: document.getElementById('topic').value.trim(),
            explanation: document.getElementById('explanation').value.trim(),
            image: null // Will be handled separately
        };
    }
    
    // Clear form
    clearForm() {
        document.getElementById('question-form').reset();
        this.editingIndex = -1;
        this.currentEditingImage = null;
        document.getElementById('save-question').innerHTML = '<i class="fas fa-save"></i> Save Question';
        this.hideImagePreview();
    }
    
    // Handle image upload
    handleImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                this.showMessage('Please select a valid image file!', 'error');
                return;
            }
            
            // Validate file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                this.showMessage('Image file is too large! Please select an image under 2MB.', 'error');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                this.showImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    }
    
    // Show image preview
    showImagePreview(imageData) {
        const preview = document.getElementById('image-preview');
        const img = document.getElementById('preview-img');
        img.src = imageData;
        preview.style.display = 'block';
    }
    
    // Hide image preview
    hideImagePreview() {
        const preview = document.getElementById('image-preview');
        preview.style.display = 'none';
        document.getElementById('question-image').value = '';
    }
    
    // Remove image
    removeImage() {
        this.hideImagePreview();
        this.currentEditingImage = null;
    }
    
    // Get image data
    async getImageData() {
        const fileInput = document.getElementById('question-image');
        if (fileInput.files.length > 0) {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.readAsDataURL(fileInput.files[0]);
            });
        }
        // If no new image uploaded but we're editing and have an existing image, keep it
        if (this.editingIndex >= 0 && this.currentEditingImage) {
            return this.currentEditingImage;
        }
        return null;
    }
    
    // Load questions from localStorage
    loadQuestions() {
        const stored = localStorage.getItem('mathMillionaireQuestions');
        if (stored) {
            this.questions = JSON.parse(stored);
        } else {
            this.questions = [];
        }
    }
    
    // Load topics from localStorage
    loadTopics() {
        const stored = localStorage.getItem('mathMillionaireTopics');
        if (stored) {
            this.topics = JSON.parse(stored);
        } else {
            // Initialize with default topics
            this.topics = [
                { name: "Arithmetic", description: "Basic addition, subtraction, multiplication, division" },
                { name: "Algebra", description: "Equations, variables, and algebraic expressions" },
                { name: "Geometry", description: "Shapes, angles, areas, and volumes" },
                { name: "Calculus", description: "Derivatives, integrals, and limits" },
                { name: "Probability", description: "Chance, statistics, and data analysis" },
                { name: "Percentages", description: "Percentage calculations and applications" },
                { name: "Sequences", description: "Number patterns and series" },
                { name: "Linear Algebra", description: "Matrices, vectors, and linear transformations" }
            ];
            this.saveTopics();
        }
    }
    
    // Save topics to localStorage
    saveTopics() {
        localStorage.setItem('mathMillionaireTopics', JSON.stringify(this.topics));
    }
    
    // Load classes from localStorage
    async loadClasses() {
        // Try to load from Firebase first, fallback to localStorage
        if (window.dataStore) {
            const stored = await window.dataStore.get('mathMillionaireClasses');
            if (stored && Array.isArray(stored)) {
                this.classes = stored;
            } else {
                // Try localStorage as fallback
                const localStored = localStorage.getItem('mathMillionaireClasses');
                if (localStored) {
                    this.classes = JSON.parse(localStored);
                    // Sync to Firebase
                    await this.saveClasses();
                } else {
                    this.classes = [];
                    await this.saveClasses();
                }
            }
        } else {
            // Fallback to localStorage only
            const stored = localStorage.getItem('mathMillionaireClasses');
            if (stored) {
                this.classes = JSON.parse(stored);
            } else {
                this.classes = [];
                this.saveClasses();
            }
        }
    }
    
    // Save classes to Firebase and localStorage
    async saveClasses() {
        if (window.dataStore) {
            // Save to Firebase
            await window.dataStore.set('mathMillionaireClasses', this.classes);
        }
        // Also save to localStorage as backup
        localStorage.setItem('mathMillionaireClasses', JSON.stringify(this.classes));
    }
    
    // Add a new class
    async addClass() {
        const classNameInput = document.getElementById('class-name');
        if (!classNameInput) {
            console.error('Class name input not found');
            this.showMessage('Error: Form element not found.', 'error');
            return;
        }
        
        const className = classNameInput.value.trim();
        
        if (!className) {
            this.showMessage('Please enter a class name.', 'error');
            return;
        }
        
        // Check if class already exists
        if (this.classes.includes(className)) {
            this.showMessage('This class already exists.', 'error');
            return;
        }
        
        // Add class to array
        this.classes.push(className);
        await this.saveClasses();
        this.renderClasses();
        this.updateClassCount();
        
        // Clear form
        classNameInput.value = '';
        
        this.showMessage('Class added successfully!', 'success');
    }
    
    // Remove a class
    async removeClass(className) {
        if (confirm(`Are you sure you want to remove "${className}"? This will not affect existing votes.`)) {
            const index = this.classes.indexOf(className);
            if (index > -1) {
                this.classes.splice(index, 1);
                await this.saveClasses();
                this.renderClasses();
                this.updateClassCount();
                this.showMessage('Class removed successfully!', 'success');
            }
        }
    }
    
    // Render classes list
    renderClasses() {
        const classesList = document.getElementById('classes-list');
        
        if (!classesList) {
            console.error('Classes list element not found');
            return;
        }
        
        if (this.classes.length === 0) {
            classesList.innerHTML = `
                <div class="alert alert-info">
                    <i class="fas fa-info-circle"></i>
                    No classes added yet. Add a class using the form on the left.
                </div>
            `;
            return;
        }
        
        // Clear existing content
        classesList.innerHTML = '';
        
        // Create class items with proper event handlers
        this.classes.forEach(className => {
            const classItem = document.createElement('div');
            classItem.className = 'class-item mb-2 p-3 border rounded d-flex justify-content-between align-items-center';
            classItem.innerHTML = `
                <div>
                    <i class="fas fa-users text-primary me-2"></i>
                    <strong>${this.escapeHtml(className)}</strong>
                </div>
                <button class="btn btn-sm btn-danger remove-class-btn" data-class-name="${this.escapeHtml(className)}">
                    <i class="fas fa-trash"></i> Remove
                </button>
            `;
            
            // Add click event listener
            const removeBtn = classItem.querySelector('.remove-class-btn');
            if (removeBtn) {
                removeBtn.addEventListener('click', () => {
                    this.removeClass(className);
                });
            }
            
            classesList.appendChild(classItem);
        });
    }
    
    // Update class count badge
    updateClassCount() {
        const classCountElement = document.getElementById('class-count');
        if (classCountElement) {
            const count = this.classes.length;
            classCountElement.textContent = `${count} class${count !== 1 ? 'es' : ''}`;
        }
    }
    
    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Save questions to localStorage
    saveQuestions() {
        localStorage.setItem('mathMillionaireQuestions', JSON.stringify(this.questions));
    }
    
    // Load default questions
    loadDefaultQuestions() {
        if (confirm('This will replace all current questions with default questions. Continue?')) {
            this.questions = [...this.defaultQuestions];
            this.saveQuestions();
            this.renderQuestions();
            this.updateQuestionCount();
            this.showMessage('Default questions loaded successfully!', 'success');
        }
    }
    
    // Clear all questions
    clearAllQuestions() {
        if (confirm('Are you sure you want to delete all questions? This action cannot be undone.')) {
            this.questions = [];
            this.saveQuestions();
            this.renderQuestions();
            this.updateQuestionCount();
            this.showMessage('All questions cleared!', 'info');
        }
    }
    
    // Render questions list
    renderQuestions() {
        const container = document.getElementById('questions-list');
        const searchTerm = document.getElementById('search-questions').value.toLowerCase();
        const topicFilter = document.getElementById('filter-topic').value;
        
        let filteredQuestions = this.questions.filter(question => {
            const matchesSearch = question.question.toLowerCase().includes(searchTerm);
            const matchesTopic = !topicFilter || question.topic === topicFilter;
            return matchesSearch && matchesTopic;
        });
        
        if (filteredQuestions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-question-circle"></i>
                    <h5>No questions found</h5>
                    <p>Add some questions to get started!</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = filteredQuestions.map((question, index) => {
            const actualIndex = this.questions.indexOf(question);
            return this.createQuestionHTML(question, actualIndex);
        }).join('');
        
        // Bind question action events
        this.bindQuestionEvents();
    }
    
    // Create HTML for a question
    createQuestionHTML(question, index) {
        return `
            <div class="question-item fade-in" data-index="${index}">
                <div class="question-header">
                    <div class="question-text">${this.renderMath(question.question)}</div>
                    ${question.image ? `<div class="question-image mt-2"><img src="${question.image}" alt="Question image" class="img-thumbnail" style="max-width: 200px; max-height: 150px;"></div>` : ''}
                </div>
                
                <div class="question-meta">
                    <span class="topic-badge">
                        ${question.topic}
                    </span>
                </div>
                
                <div class="options-preview">
                    ${question.options.map((option, optIndex) => `
                        <div class="option-preview ${optIndex === question.correct ? 'correct' : ''}">
                            <span class="option-letter">${String.fromCharCode(65 + optIndex)}</span>
                            <span class="option-text">${this.renderMath(option)}</span>
                        </div>
                    `).join('')}
                </div>
                
                ${question.explanation ? `
                    <div class="explanation">
                        <strong>Explanation:</strong> ${question.explanation}
                    </div>
                ` : ''}
                
                <div class="question-actions">
                    <button class="btn btn-preview action-btn" data-action="preview" data-index="${index}">
                        <i class="fas fa-eye"></i> Preview
                    </button>
                    <button class="btn btn-edit action-btn" data-action="edit" data-index="${index}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-delete action-btn" data-action="delete" data-index="${index}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
    }
    
    // Bind events for question actions
    bindQuestionEvents() {
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                const index = parseInt(e.currentTarget.dataset.index);
                
                switch (action) {
                    case 'edit':
                        this.editQuestion(index);
                        break;
                    case 'delete':
                        this.deleteQuestion(index);
                        break;
                    case 'preview':
                        this.previewQuestion(index);
                        break;
                }
            });
        });
    }
    
    // Edit question
    editQuestion(index) {
        const question = this.questions[index];
        
        // Fill form with question data
        document.getElementById('question-text').value = question.question;
        document.getElementById('option-a').value = question.options[0];
        document.getElementById('option-b').value = question.options[1];
        document.getElementById('option-c').value = question.options[2];
        document.getElementById('option-d').value = question.options[3];
        document.getElementById('correct-answer').value = question.correct;
        document.getElementById('topic').value = question.topic;
        document.getElementById('explanation').value = question.explanation || '';
        
        // Handle image if exists
        if (question.image) {
            this.showImagePreview(question.image);
            // Store the existing image data for later use
            this.currentEditingImage = question.image;
        } else {
            this.hideImagePreview();
            this.currentEditingImage = null;
        }
        
        // Update form state
        this.editingIndex = index;
        document.getElementById('save-question').innerHTML = '<i class="fas fa-save"></i> Update Question';
        
        // Scroll to form
        document.querySelector('.col-lg-4').scrollIntoView({ behavior: 'smooth' });
    }
    
    // Delete question
    deleteQuestion(index) {
        if (confirm('Are you sure you want to delete this question?')) {
            this.questions.splice(index, 1);
            this.saveQuestions();
            this.renderQuestions();
            this.updateQuestionCount();
            this.showMessage('Question deleted successfully!', 'success');
        }
    }
    
    // Preview question
    previewQuestion(index) {
        const question = this.questions[index];
        const modal = new bootstrap.Modal(document.getElementById('previewModal'));
        
        document.getElementById('preview-content').innerHTML = `
            <div class="question-preview">
                <h6 class="text-muted mb-3">Question Preview</h6>
                <div class="question-text mb-4" style="font-size: 1.2rem; font-weight: 600;">
                    ${this.renderMath(question.question)}
                </div>
                ${question.image ? `<div class="question-image mb-4"><img src="${question.image}" alt="Question image" class="img-fluid" style="max-width: 300px; max-height: 200px;"></div>` : ''}
                
                <div class="options-preview mb-4">
                    ${question.options.map((option, optIndex) => `
                        <div class="option-preview ${optIndex === question.correct ? 'correct' : ''} mb-2">
                            <span class="option-letter">${String.fromCharCode(65 + optIndex)}</span>
                            <span class="option-text">${this.renderMath(option)}</span>
                        </div>
                    `).join('')}
                </div>
                
                <div class="question-meta mb-3">
                    <span class="badge bg-primary">
                        ${question.topic}
                    </span>
                </div>
                
                ${question.explanation ? `
                    <div class="explanation">
                        <strong>Explanation:</strong> ${question.explanation}
                    </div>
                ` : ''}
            </div>
        `;
        
        modal.show();
    }
    
    // Get difficulty name
    getDifficultyName(level) {
        const names = ['', 'Basic', 'Intermediate', 'Advanced', 'Expert', 'Master'];
        return names[level] || 'Unknown';
    }
    
    // Get difficulty color
    getDifficultyColor(level) {
        const colors = ['', 'success', 'info', 'warning', 'danger', 'primary'];
        return colors[level] || 'secondary';
    }
    
    // Update topic select dropdowns
    updateTopicSelects() {
        const topicSelect = document.getElementById('topic');
        const filterSelect = document.getElementById('filter-topic');
        
        // Clear existing options
        topicSelect.innerHTML = '<option value="">Select or create a topic...</option>';
        filterSelect.innerHTML = '<option value="">All Topics</option>';
        
        // Add topics to both selects
        this.topics.forEach(topic => {
            const option1 = document.createElement('option');
            option1.value = topic.name;
            option1.textContent = topic.name;
            topicSelect.appendChild(option1);
            
            const option2 = document.createElement('option');
            option2.value = topic.name;
            option2.textContent = topic.name;
            filterSelect.appendChild(option2);
        });
    }
    
    // Show add topic modal
    showAddTopicModal() {
        const modal = new bootstrap.Modal(document.getElementById('addTopicModal'));
        document.getElementById('new-topic-name').value = '';
        document.getElementById('new-topic-description').value = '';
        modal.show();
    }
    
    // Save new topic
    saveTopic() {
        const name = document.getElementById('new-topic-name').value.trim();
        const description = document.getElementById('new-topic-description').value.trim();
        
        if (!name) {
            this.showMessage('Please enter a topic name!', 'error');
            return;
        }
        
        // Check if topic already exists
        if (this.topics.some(topic => topic.name.toLowerCase() === name.toLowerCase())) {
            this.showMessage('Topic already exists!', 'error');
            return;
        }
        
        // Add new topic
        this.topics.push({ name, description });
        this.saveTopics();
        this.updateTopicSelects();
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('addTopicModal'));
        modal.hide();
        
        this.showMessage('Topic added successfully!', 'success');
    }
    
    // Filter questions
    filterQuestions() {
        this.renderQuestions();
    }
    
    // Sort questions by topic
    sortQuestions() {
        this.questions.sort((a, b) => a.topic.localeCompare(b.topic));
        this.saveQuestions();
        this.renderQuestions();
        this.showMessage('Questions sorted by topic!', 'info');
    }
    
    // Update question count
    updateQuestionCount() {
        document.getElementById('question-count').textContent = `${this.questions.length} questions`;
    }
    
    // Show message
    showMessage(text, type) {
        // Remove existing messages
        document.querySelectorAll('.message').forEach(msg => msg.remove());
        
        const message = document.createElement('div');
        message.className = `message ${type}`;
        message.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            ${text}
        `;
        
        // Insert message after the tabs navigation
        const container = document.querySelector('.container-fluid');
        const tabsNav = document.querySelector('.nav-tabs');
        if (container && tabsNav) {
            container.insertBefore(message, tabsNav.nextSibling);
        } else if (container) {
            // Fallback: insert at the beginning of container
            container.insertBefore(message, container.firstChild);
        }
        
        setTimeout(() => {
            message.remove();
        }, 3000);
    }
    
    // Export questions
    exportQuestions() {
        if (this.questions.length === 0) {
            this.showMessage('No questions to export!', 'error');
            return;
        }
        
        const dataStr = JSON.stringify(this.questions, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'math-millionaire-questions.json';
        link.click();
        
        URL.revokeObjectURL(url);
        this.showMessage('Questions exported successfully!', 'success');
    }
    
    // Show import modal
    showImportModal() {
        const modal = new bootstrap.Modal(document.getElementById('importModal'));
        modal.show();
    }
    
    // Import questions
    importQuestions() {
        const fileInput = document.getElementById('import-file');
        const file = fileInput.files[0];
        
        if (!file) {
            this.showMessage('Please select a file to import!', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedQuestions = JSON.parse(e.target.result);
                
                if (Array.isArray(importedQuestions)) {
                    if (confirm(`Import ${importedQuestions.length} questions? This will replace all current questions.`)) {
                        this.questions = importedQuestions;
                        this.saveQuestions();
                        this.renderQuestions();
                        this.updateQuestionCount();
                        this.showMessage('Questions imported successfully!', 'success');
                        
                        // Close modal
                        const modal = bootstrap.Modal.getInstance(document.getElementById('importModal'));
                        modal.hide();
                    }
                } else {
                    this.showMessage('Invalid file format! Please select a valid JSON file.', 'error');
                }
            } catch (error) {
                this.showMessage('Error reading file! Please check the file format.', 'error');
            }
        };
        
        reader.readAsText(file);
    }
    
    // Preview game
    previewGame() {
        if (this.questions.length === 0) {
            this.showMessage('No questions available! Please add some questions first.', 'error');
            return;
        }
        
        // Open game in new tab
        window.open('index.html', '_blank');
    }
    
    // Insert math symbol into input field
    insertMathSymbol(symbol, targetId) {
        const targetElement = document.getElementById(targetId);
        if (!targetElement) return;
        
        const start = targetElement.selectionStart;
        const end = targetElement.selectionEnd;
        const text = targetElement.value;
        
        // Insert symbol at cursor position
        const newText = text.substring(0, start) + symbol + text.substring(end);
        targetElement.value = newText;
        
        // Set cursor position after inserted symbol
        const newPosition = start + symbol.length;
        targetElement.setSelectionRange(newPosition, newPosition);
        targetElement.focus();
    }
    
    // Render mathematical expressions
    renderMath(text) {
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
    }
}

// Initialize admin panel when page loads
document.addEventListener('DOMContentLoaded', () => {
    new QuestionManager();
});
