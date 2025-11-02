document.addEventListener('DOMContentLoaded', () => {
    const maxVeggieSelections = 5;
    const maxDecisionSelections = 2;
    const maxMotivationSelections = 2;
    
    const veggieCards = document.querySelectorAll('.veggie-card');
    const hiddenCheckboxes = document.querySelectorAll('input[name="favoriteVeggie"]');
    const decisionCheckboxes = document.querySelectorAll('#decision-making input[name="decisionFactors"]');
    const motivationCheckboxes = document.querySelectorAll('#decision-making input[name="motivationFactors"]');
    
    const veggieLimitMessage = document.getElementById('veggie-limit-message');
    const decisionLimitMessage = document.getElementById('decision-limit-message');
    const motivationLimitMessage = document.getElementById('motivation-limit-message');

    // Navigation buttons - Updated for 6 pages
    const nextButton0 = document.getElementById('nextButton0');
    const nextButton1 = document.getElementById('nextButton1');
    const nextButton2 = document.getElementById('nextButton2');
    const nextButton3 = document.getElementById('nextButton3');
    const nextButton4 = document.getElementById('nextButton4');
    const prevButton1 = document.getElementById('prevButton1');
    const prevButton2 = document.getElementById('prevButton2');
    const prevButton3 = document.getElementById('prevButton3');
    const prevButton4 = document.getElementById('prevButton4');
    const restartButton = document.getElementById('restartButton');

    // Pages - Updated for 6 pages
    const page0 = document.getElementById('page0');
    const page1 = document.getElementById('page1');
    const page2 = document.getElementById('page2');
    const page3 = document.getElementById('page3');
    const page4 = document.getElementById('page4');
    const page5 = document.getElementById('page5');

    // Popup elements
    const popupContainer = document.getElementById('customPopup');
    const popupMessage = document.getElementById('popupMessage');
    const popupClose = document.getElementById('popupClose');

    const progressBar = document.getElementById('progress');
    const surveyForm = document.getElementById('surveyForm');

    // Store for XML data
    let surveyQuestions = {};
    let currentLanguage = 'english';

    console.log('DOM loaded - checking elements:', {
        nextButton0: !!nextButton0,
        nextButton1: !!nextButton1,
        nextButton2: !!nextButton2,
        nextButton3: !!nextButton3,
        nextButton4: !!nextButton4,
        prevButton1: !!prevButton1,
        prevButton2: !!prevButton2,
        prevButton3: !!prevButton3,
        prevButton4: !!prevButton4,
        page0: !!page0,
        page1: !!page1,
        page2: !!page2,
        page3: !!page3,
        page4: !!page4,
        page5: !!page5
    });

    // Load XML questions
    function loadSurveyQuestions() {
        fetch('survey-questions.xml')
            .then(response => response.text())
            .then(data => {
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(data, "text/xml");
                
                // Parse all languages
                const languages = xmlDoc.getElementsByTagName('language');
                for (let lang of languages) {
                    const langCode = lang.getAttribute('code');
                    surveyQuestions[langCode] = {};
                    
                    // Parse questions
                    const questions = lang.getElementsByTagName('question');
                    for (let q of questions) {
                        const id = q.getAttribute('id');
                        surveyQuestions[langCode][id] = q.textContent;
                    }
                    
                    // Parse options
                    const options = lang.getElementsByTagName('option');
                    for (let opt of options) {
                        const id = opt.getAttribute('id');
                        surveyQuestions[langCode][id] = opt.textContent;
                    }
                }
                
                console.log('Survey questions loaded:', surveyQuestions);
            })
            .catch(error => {
                console.error('Error loading survey questions:', error);
            });
    }

    // Update UI with selected language
    function updateSurveyLanguage(language) {
        currentLanguage = language;
        const langData = surveyQuestions[language];
        
        if (!langData) {
            console.error('Language data not found:', language);
            return;
        }

        // Update all question legends
        const questionIds = [
            'age-group', 'role-selection', 'income', 'veggie-selection',
            'buying-location', 'purchase-frequency', 'spending-amount',
            'core-problem', 'solution-interest', 'usage-context', 
            'decision-making', 'prototype-testing', 'open-feedback'
        ];

        questionIds.forEach(id => {
            const element = document.querySelector(`#${id} legend`);
            if (element && langData[id]) {
                element.textContent = langData[id];
            }
        });

        // Update individual question texts
        const individualQuestions = [
            'price-effect', 'price-response', 'budget-difficulty', 'purchase-adjustment',
            'price-forecast-useful', 'budget-recommendation', 'recipe-suggestions',
            'smartphone-ownership', 'app-comfort', 'decision-factors', 'forecast-useful',
            'motivation-factors', 'app-likely', 'prototype-interest'
        ];

        individualQuestions.forEach(id => {
            const element = document.getElementById(`${id}-question`);
            if (element && langData[id]) {
                element.textContent = langData[id];
            }
        });

        // Update option texts
        updateOptionTexts(langData);
    }

    // Update option texts throughout the survey
    function updateOptionTexts(langData) {
        // Age group options
        updateRadioOptions('ageGroup', ['under-25', '25-35', '36-45', '46-55', '55-plus'], langData);
        
        // Household size options
        updateRadioOptions('membersinfamily', ['1-2', '3-4', '5-6', '6+'], langData);
        
        // Income options
        updateRadioOptions('income', ['less than 50000', '50,000 - 100,000', '100,000 - 150,000', '150,000 - 200,000', '200,000 - 250,000'], langData);
        
        // Vegetable names
        updateVeggieNames(langData);
        
        // Buying location options
        updateRadioOptions('buyingLocation', ['vegetable-market', 'local-fair', 'supermarket', 'grocery-store', 'farmer', 'online'], langData);
        
        // Purchase frequency options
        updateRadioOptions('purchaseFrequency', ['daily', '2-3-times', 'weekly', 'less-than-weekly'], langData);
        
        // Spending amount options
        updateRadioOptions('spendingAmount', ['less-than-1000', '1001-2500', '2501-5000', 'more-than-5000'], langData);
        
        // Page 3 options
        updateRadioOptions('priceEffect', ['always', 'frequently', 'sometimes', 'rarely', 'never'], langData);
        updateCheckboxOptions('priceResponse', ['buy-smaller', 'switch-cheaper', 'reduce-consumption', 'no-change'], langData);
        updateRadioOptions('budgetDifficulty', ['yes-always', 'yes-sometimes', 'no-manage', 'no-never'], langData);
        updateRadioOptions('purchaseAdjustment', ['cut-back', 'spend-less-other', 'cheaper-alternatives', 'other'], langData);
        
        // Page 4 options
        updateRadioOptions('priceForecastUseful', ['very-useful', 'useful', 'somewhat-useful', 'not-useful'], langData);
        updateRadioOptions('budgetRecommendation', ['very-interested', 'interested', 'neutral', 'not-interested'], langData);
        updateRadioOptions('recipeSuggestions', ['yes-definitely', 'probably', 'maybe', 'no'], langData);
        updateRadioOptions('smartphoneOwnership', ['smartphone', 'basic-phone', 'no-phone'], langData);
        updateRadioOptions('appComfort', ['very-comfortable', 'comfortable', 'neutral', 'uncomfortable'], langData);
        updateCheckboxOptions('decisionFactors', ['current-prices', 'family-preferences', 'nutritional-value', 'seasonal-availability', 'no-specific-plan'], langData);
        updateRadioOptions('forecastUseful', ['1-2-days', '3-7-days', '1-2-weeks'], langData);
        updateCheckboxOptions('motivationFactors', ['saving-money', 'better-meal-planning', 'nutritional-benefits', 'time-savings'], langData);
        updateRadioOptions('appLikely', ['very-likely', 'likely', 'neutral', 'unlikely'], langData);
        updateRadioOptions('prototypeInterest', ['yes', 'maybe', 'no'], langData);
    }

    // Helper function to update radio option texts
    function updateRadioOptions(name, values, langData) {
        values.forEach(value => {
            const element = document.querySelector(`input[name="${name}"][value="${value}"]`);
            if (element) {
                const parent = element.closest('.selection-option');
                const span = parent?.querySelector('.option-card span');
                if (span && langData[value]) {
                    span.textContent = langData[value];
                }
            }
        });
    }

    // Helper function to update checkbox option texts
    function updateCheckboxOptions(name, values, langData) {
        values.forEach(value => {
            const element = document.querySelector(`input[name="${name}"][value="${value}"]`);
            if (element) {
                const parent = element.closest('.selection-option');
                const span = parent?.querySelector('.option-card span');
                if (span && langData[value]) {
                    span.textContent = langData[value];
                }
            }
        });
    }

    // Update vegetable names
    function updateVeggieNames(langData) {
        const veggieNames = [
            'carrot', 'beetroot', 'red-onion', 'cabbage', 'leeks', 
            'tomato', 'brinjal', 'cucumber', 'pumpkin', 'bitter-gourd',
            'okra', 'beans', 'long-beans', 'green-chili'
        ];

        veggieNames.forEach(veggie => {
            const card = document.querySelector(`.veggie-card[data-veggie="${veggie}"]`);
            if (card) {
                const nameElement = card.querySelector('.veggie-name');
                if (nameElement && langData[veggie]) {
                    nameElement.textContent = langData[veggie];
                }
            }
        });
    }

    // Initialize progress bar for 6 pages
    if (progressBar) {
        progressBar.style.width = '16.66%';
    }

    // Function to show custom popup
    function showPopup(message) {
        if (popupMessage && popupContainer) {
            popupMessage.textContent = message;
            popupContainer.style.display = 'flex';
        }
    }

    // Close popup when close button is clicked
    if (popupClose) {
        popupClose.addEventListener('click', () => {
            popupContainer.style.display = 'none';
        });
    }

    // Close popup when clicking outside the content
    if (popupContainer) {
        popupContainer.addEventListener('click', (e) => {
            if (e.target === popupContainer) {
                popupContainer.style.display = 'none';
            }
        });
    }

    // Enhanced Vegetable Selection Logic
    function setupEnhancedVeggieSelection() {
        const selectedCountEl = document.getElementById('selectedCount');
        const selectionProgressEl = document.getElementById('selectionProgress');

        // Create a mapping between card data and checkboxes
        const veggieMap = new Map();
        hiddenCheckboxes.forEach(checkbox => {
            veggieMap.set(checkbox.value, checkbox);
        });

        // Initialize selection state
        let selectedCount = 0;

        // Update visual indicators
        function updateSelectionUI() {
            selectedCountEl.textContent = selectedCount;
            const progressPercent = (selectedCount / maxVeggieSelections) * 100;
            selectionProgressEl.style.width = `${progressPercent}%`;
            
            // Change progress color based on selection count
            if (selectedCount === maxVeggieSelections) {
                selectionProgressEl.style.background = 'linear-gradient(90deg, #ff6b6b, #ff5252)';
            } else {
                selectionProgressEl.style.background = 'linear-gradient(90deg, #4CAF50, #45a049)';
            }
        }

        // Handle card clicks
        veggieCards.forEach(card => {
            card.addEventListener('click', () => {
                const veggieName = card.getAttribute('data-veggie');
                const checkbox = veggieMap.get(veggieName);

                if (!checkbox) return;

                if (checkbox.checked) {
                    // Deselect
                    checkbox.checked = false;
                    card.classList.remove('selected');
                    selectedCount--;
                } else {
                    // Select if under limit
                    if (selectedCount < maxVeggieSelections) {
                        checkbox.checked = true;
                        card.classList.add('selected');
                        selectedCount++;
                    } else {
                        showPopup("You can only select up to 5 vegetables!");
                        return;
                    }
                }

                updateSelectionUI();
            });
        });

        // Initialize from existing checkboxes (if any are pre-checked)
        function initializeFromCheckboxes() {
            selectedCount = 0;
            hiddenCheckboxes.forEach(checkbox => {
                if (checkbox.checked) {
                    selectedCount++;
                    const card = document.querySelector(`[data-veggie="${checkbox.value}"]`);
                    if (card) {
                        card.classList.add('selected');
                    }
                }
            });
            updateSelectionUI();
        }

        initializeFromCheckboxes();
    }

    // Generic function to handle checkbox limits
    function setupCheckboxLimit(checkboxes, maxSelections, limitMessage) {
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                const checkedBoxes = Array.from(checkboxes).filter(cb => cb.checked);

                if (checkedBoxes.length > maxSelections) {
                    checkbox.checked = false;
                    showPopup(`You can only select up to ${maxSelections} options!`);
                    if (limitMessage) {
                        limitMessage.style.display = 'none';
                    }
                } else {
                    if (limitMessage) {
                        limitMessage.style.display = 'none';
                    }
                }
            });
        });
    }

    // Data submission function
    async function submitSurveyData(data) {
        try {
            const response = await fetch('http://localhost:5000/api/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            
            if (result.success) {
                console.log('✅ Survey data submitted successfully:', result.responseId);
                return true;
            } else {
                console.error('❌ Failed to submit survey data:', result.message);
                return false;
            }
        } catch (error) {
            console.error('❌ Error submitting survey data:', error);
            showPopup('Failed to submit survey. Please try again.');
            return false;
        }
    }

    // Load survey questions and setup
    loadSurveyQuestions();

    // Setup all features
    setupEnhancedVeggieSelection();
    setupCheckboxLimit(decisionCheckboxes, maxDecisionSelections, decisionLimitMessage);
    setupCheckboxLimit(motivationCheckboxes, maxMotivationSelections, motivationLimitMessage);

    // Page 0 to Page 1 navigation
    if (nextButton0) {
        nextButton0.addEventListener('click', () => {
            console.log('Next button 0 clicked');

            // Validate language selection
            const languageSelected = document.querySelector('input[name="preferredLanguage"]:checked');

            console.log('Language validation:', {
                languageSelected: !!languageSelected
            });

            if (!languageSelected) {
                showPopup('Please select your preferred language before starting the survey.');
                return;
            }

            // Update survey language
            const selectedLanguage = languageSelected.value;
            updateSurveyLanguage(selectedLanguage);

            // Switch to page 1
            if (page0 && page1) {
                page0.classList.remove('active');
                page1.classList.add('active');
                console.log('Switched to page 1');

                if (progressBar) {
                    progressBar.style.width = '33.33%';
                }
            } else {
                console.error('Page elements not found');
            }
        });
    } else {
        console.error('Next button 0 not found');
    }

    // Page 1 to Page 2 navigation
    if (nextButton1) {
        nextButton1.addEventListener('click', () => {
            console.log('Next button 1 clicked');

            // Validate required fields on page 1
            const ageSelected = document.querySelector('input[name="ageGroup"]:checked');
            const householdSelected = document.querySelector('input[name="membersinfamily"]:checked');
            const incomeSelected = document.querySelector('input[name="income"]:checked');
            const veggieSelected = document.querySelectorAll('input[name="favoriteVeggie"]:checked').length > 0;

            console.log('Validation:', {
                ageSelected: !!ageSelected,
                householdSelected: !!householdSelected,
                incomeSelected: !!incomeSelected,
                veggieSelected: veggieSelected
            });

            if (!ageSelected || !householdSelected || !incomeSelected) {
                showPopup('Please answer all required questions before proceeding.');
                return;
            }

            if (!veggieSelected) {
                showPopup('Please select at least 1 vegetable before proceeding.');
                return;
            }

            // Switch to page 2
            if (page1 && page2) {
                page1.classList.remove('active');
                page2.classList.add('active');
                console.log('Switched to page 2');

                if (progressBar) {
                    progressBar.style.width = '50%';
                }
            } else {
                console.error('Page elements not found');
            }
        });
    } else {
        console.error('Next button 1 not found');
    }

    // Page 1 to Page 0 navigation (Previous)
    if (prevButton1) {
        prevButton1.addEventListener('click', () => {
            console.log('Previous button 1 clicked');

            // Switch back to page 0
            if (page0 && page1) {
                page1.classList.remove('active');
                page0.classList.add('active');

                if (progressBar) {
                    progressBar.style.width = '16.66%';
                }
            }
        });
    }

    // Page 2 to Page 3 navigation
    if (nextButton2) {
        nextButton2.addEventListener('click', () => {
            console.log('Next button 2 clicked');

            // Validate required fields on page 2
            const locationSelected = document.querySelector('input[name="buyingLocation"]:checked');
            const frequencySelected = document.querySelector('input[name="purchaseFrequency"]:checked');
            const spendingSelected = document.querySelector('input[name="spendingAmount"]:checked');

            console.log('Page 2 validation:', {
                locationSelected: !!locationSelected,
                frequencySelected: !!frequencySelected,
                spendingSelected: !!spendingSelected
            });

            if (!locationSelected || !frequencySelected || !spendingSelected) {
                showPopup('Please answer all questions before proceeding.');
                return;
            }

            // Switch to page 3
            if (page2 && page3) {
                page2.classList.remove('active');
                page3.classList.add('active');
                console.log('Switched to page 3');

                if (progressBar) {
                    progressBar.style.width = '66.66%';
                }
            } else {
                console.error('Page elements not found');
            }
        });
    } else {
        console.error('Next button 2 not found');
    }

    // Page 2 to Page 1 navigation (Previous)
    if (prevButton2) {
        prevButton2.addEventListener('click', () => {
            console.log('Previous button 2 clicked');

            // Switch back to page 1
            if (page1 && page2) {
                page2.classList.remove('active');
                page1.classList.add('active');

                if (progressBar) {
                    progressBar.style.width = '33.33%';
                }
            }
        });
    }

    // Page 3 to Page 4 navigation
    if (nextButton3) {
        nextButton3.addEventListener('click', () => {
            console.log('Next button 3 clicked');

            // Validate required fields on page 3
            const priceEffectSelected = document.querySelector('input[name="priceEffect"]:checked');
            const budgetDifficultySelected = document.querySelector('input[name="budgetDifficulty"]:checked');
            const purchaseAdjustmentSelected = document.querySelector('input[name="purchaseAdjustment"]:checked');

            console.log('Page 3 validation:', {
                priceEffectSelected: !!priceEffectSelected,
                budgetDifficultySelected: !!budgetDifficultySelected,
                purchaseAdjustmentSelected: !!purchaseAdjustmentSelected
            });

            if (!priceEffectSelected || !budgetDifficultySelected || !purchaseAdjustmentSelected) {
                showPopup('Please answer all required questions before proceeding.');
                return;
            }

            // Switch to page 4
            if (page3 && page4) {
                page3.classList.remove('active');
                page4.classList.add('active');
                console.log('Switched to page 4');

                if (progressBar) {
                    progressBar.style.width = '83.33%';
                }
            } else {
                console.error('Page elements not found');
            }
        });
    } else {
        console.error('Next button 3 not found');
    }

    // Page 3 to Page 2 navigation (Previous)
    if (prevButton3) {
        prevButton3.addEventListener('click', () => {
            console.log('Previous button 3 clicked');

            // Switch back to page 2
            if (page2 && page3) {
                page3.classList.remove('active');
                page2.classList.add('active');

                if (progressBar) {
                    progressBar.style.width = '50%';
                }
            }
        });
    }

    // Page 4 to Page 5 navigation (Submit)
    if (nextButton4) {
        nextButton4.addEventListener('click', async () => {
            console.log('Submit button clicked');

            // Validate required fields on page 4
            const priceForecastSelected = document.querySelector('input[name="priceForecastUseful"]:checked');
            const budgetRecommendationSelected = document.querySelector('input[name="budgetRecommendation"]:checked');
            const recipeSuggestionsSelected = document.querySelector('input[name="recipeSuggestions"]:checked');
            const smartphoneSelected = document.querySelector('input[name="smartphoneOwnership"]:checked');
            const appComfortSelected = document.querySelector('input[name="appComfort"]:checked');
            const forecastUsefulSelected = document.querySelector('input[name="forecastUseful"]:checked');
            const appLikelySelected = document.querySelector('input[name="appLikely"]:checked');
            const prototypeSelected = document.querySelector('input[name="prototypeInterest"]:checked');

            console.log('Page 4 validation:', {
                priceForecastSelected: !!priceForecastSelected,
                budgetRecommendationSelected: !!budgetRecommendationSelected,
                recipeSuggestionsSelected: !!recipeSuggestionsSelected,
                smartphoneSelected: !!smartphoneSelected,
                appComfortSelected: !!appComfortSelected,
                forecastUsefulSelected: !!forecastUsefulSelected,
                appLikelySelected: !!appLikelySelected,
                prototypeSelected: !!prototypeSelected
            });

            if (!priceForecastSelected || !budgetRecommendationSelected || !recipeSuggestionsSelected || 
                !smartphoneSelected || !appComfortSelected || !forecastUsefulSelected || 
                !appLikelySelected || !prototypeSelected) {
                showPopup('Please answer all required questions before submitting.');
                return;
            }

            // Collect form data
            const formData = new FormData(surveyForm);
            const data = {};

            for (let [key, value] of formData.entries()) {
                if (data[key]) {
                    if (Array.isArray(data[key])) {
                        data[key].push(value);
                    } else {
                        data[key] = [data[key], value];
                    }
                } else {
                    data[key] = value;
                }
            }

            // Handle checkboxes separately
            const favoriteVeggies = [];
            document.querySelectorAll('input[name="favoriteVeggie"]:checked').forEach(checkbox => {
                favoriteVeggies.push(checkbox.value);
            });
            data.favoriteVeggie = favoriteVeggies;

            const priceResponses = [];
            document.querySelectorAll('input[name="priceResponse"]:checked').forEach(checkbox => {
                priceResponses.push(checkbox.value);
            });
            data.priceResponse = priceResponses;

            const decisionFactors = [];
            document.querySelectorAll('input[name="decisionFactors"]:checked').forEach(checkbox => {
                decisionFactors.push(checkbox.value);
            });
            data.decisionFactors = decisionFactors;

            const motivationFactors = [];
            document.querySelectorAll('input[name="motivationFactors"]:checked').forEach(checkbox => {
                motivationFactors.push(checkbox.value);
            });
            data.motivationFactors = motivationFactors;

            // Add language information
            data.language = currentLanguage;

            // Show loading state
            nextButton4.textContent = 'Submitting...';
            nextButton4.disabled = true;

            // Submit data to backend
            const success = await submitSurveyData(data);

            if (success) {
                // Switch to page 5 (Thank You page)
                if (page4 && page5) {
                    page4.classList.remove('active');
                    page5.classList.add('active');

                    if (progressBar) {
                        progressBar.style.width = '100%';
                    }
                }
            } else {
                // Re-enable button if submission failed
                nextButton4.textContent = 'Submit';
                nextButton4.disabled = false;
            }
        });
    }

    // Page 4 to Page 3 navigation (Previous)
    if (prevButton4) {
        prevButton4.addEventListener('click', () => {
            console.log('Previous button 4 clicked');

            // Switch back to page 3
            if (page3 && page4) {
                page4.classList.remove('active');
                page3.classList.add('active');

                if (progressBar) {
                    progressBar.style.width = '66.66%';
                }
            }
        });
    }

    // Restart survey button
    if (restartButton) {
        restartButton.addEventListener('click', () => {
            // Reset the form and go back to page 0
            surveyForm.reset();
            if (page5 && page0) {
                page5.classList.remove('active');
                page0.classList.add('active');
            }
            if (progressBar) {
                progressBar.style.width = '16.66%';
            }
            if (veggieLimitMessage) {
                veggieLimitMessage.style.display = 'none';
            }
            if (decisionLimitMessage) {
                decisionLimitMessage.style.display = 'none';
            }
            if (motivationLimitMessage) {
                motivationLimitMessage.style.display = 'none';
            }
            
            // Reset enhanced vegetable selection UI
            const veggieCards = document.querySelectorAll('.veggie-card');
            veggieCards.forEach(card => {
                card.classList.remove('selected');
            });
            document.getElementById('selectedCount').textContent = '0';
            document.getElementById('selectionProgress').style.width = '0%';
            document.getElementById('selectionProgress').style.background = 'linear-gradient(90deg, #4CAF50, #45a049)';
        });
    }

    // Card selection setup
    function setupCardSelections() {
        // Setup radio card selections
        const radioCards = document.querySelectorAll('.card-option input[type="radio"]');
        radioCards.forEach(radio => {
            const card = radio.parentElement;
            radio.addEventListener('change', () => {
                // Remove selected class from all cards in the same group
                const groupName = radio.name;
                const groupCards = document.querySelectorAll(`input[name="${groupName}"]`);
                groupCards.forEach(otherRadio => {
                    otherRadio.parentElement.classList.remove('selected');
                });
                
                // Add selected class to current card
                if (radio.checked) {
                    card.classList.add('selected');
                }
            });
        });

        // Setup checkbox card selections
        const checkboxCards = document.querySelectorAll('.card-option input[type="checkbox"]');
        checkboxCards.forEach(checkbox => {
            const card = checkbox.parentElement;
            checkbox.addEventListener('change', () => {
                if (checkbox.checked) {
                    card.classList.add('selected');
                } else {
                    card.classList.remove('selected');
                }
            });
        });

        // Initialize from existing selections
        radioCards.forEach(radio => {
            if (radio.checked) {
                radio.parentElement.classList.add('selected');
            }
        });
        
        checkboxCards.forEach(checkbox => {
            if (checkbox.checked) {
                checkbox.parentElement.classList.add('selected');
            }
        });
    }

    setupCardSelections();
});