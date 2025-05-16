/**
 * Assistant Scrabble - Script principal avec recherche automatique
 * 
 * Ce script permet de rechercher des mots dans un dictionnaire français ou anglais
 * à partir des lettres disponibles. Il gère également les jokers (?) et le tri des résultats.
 * 
 * Fonctionnalités:
 * - Recherche automatique 2 secondes après la dernière saisie
 * - Support des jokers (représentés par le caractère "?")
 * - Chargement dynamique des dictionnaires français et anglais
 * - Calcul du score Scrabble pour chaque mot
 * - Lien vers la vérification de validité du mot au Scrabble
 * - Lien vers la définition du mot
 * 
 * @author Replit
 * @version 1.0.0
 */
document.addEventListener('DOMContentLoaded', function() {
    // Éléments DOM
    const letterInput = document.getElementById('letterInput');
    const letterTiles = document.getElementById('letterTiles');
    const hasJokerCheckbox = document.getElementById('hasJoker');
    const lengthFilter = document.getElementById('lengthFilter');
    const sortByScoreCheckbox = document.getElementById('sortByScore');
    const searchBtn = document.getElementById('searchBtn');
    const resetBtn = document.getElementById('resetBtn');
    const advancedOptionsToggle = document.getElementById('advancedOptionsToggle');
    const advancedOptions = document.getElementById('advancedOptions');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const resultsCount = document.getElementById('resultsCount');
    const wordList = document.getElementById('wordList');
    const errorMessage = document.getElementById('errorMessage');
    const dictionaryStats = document.getElementById('dictionaryStats');
    const frOption = document.getElementById('fr-option');
    const enOption = document.getElementById('en-option');
    const statusIcon = document.getElementById('statusIcon');
    const loadingStatus = document.getElementById('loadingStatus');
    
    // Variables de l'application
    let currentLanguage = 'francais'; // Par défaut : français
    let searchTimeout = null; // Pour la recherche automatique
    let sortByWord = false; // Pour alterner entre tri par score et tri par mot
    
    // Points des lettres en français
    const letterScoresFR = {
        'A': 1, 'B': 3, 'C': 3, 'D': 2, 'E': 1, 'F': 4, 'G': 2, 'H': 4, 'I': 1, 'J': 8,
        'K': 10, 'L': 1, 'M': 2, 'N': 1, 'O': 1, 'P': 3, 'Q': 8, 'R': 1, 'S': 1, 'T': 1,
        'U': 1, 'V': 4, 'W': 10, 'X': 10, 'Y': 10, 'Z': 10
    };
    
    // Points des lettres en anglais
    const letterScoresEN = {
        'A': 1, 'B': 3, 'C': 3, 'D': 2, 'E': 1, 'F': 4, 'G': 2, 'H': 4, 'I': 1, 'J': 8,
        'K': 5, 'L': 1, 'M': 3, 'N': 1, 'O': 1, 'P': 3, 'Q': 10, 'R': 1, 'S': 1, 'T': 1,
        'U': 1, 'V': 4, 'W': 4, 'X': 8, 'Y': 4, 'Z': 10
    };
    
    // Définir initialement quelle langue est active au démarrage
    window.addEventListener('load', function() {
        setLanguage('francais');
    });
    
    // Dictionnaires
    let dictFr = []; // Dictionnaire français
    let dictEn = []; // Dictionnaire anglais
    
    // Initialiser l'interface
    letterInput.addEventListener('input', function() {
        updateLetterTiles();
        triggerAutoSearch();
    });
    
    // Déclencher une recherche automatique après 2 secondes d'inactivité
    function triggerAutoSearch() {
        // Annuler tout timeout précédent
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        
        // Définir un nouveau timeout
        searchTimeout = setTimeout(function() {
            // Lancer la recherche automatiquement si on a au moins 1 lettre
            if (letterInput.value.length >= 1) {
                searchWords();
            }
        }, 2000); // 2 secondes
    }
    
    // Écouteurs d'événements pour les autres contrôles
    searchBtn.addEventListener('click', searchWords);
    resetBtn.addEventListener('click', resetForm);
    advancedOptionsToggle.addEventListener('click', toggleAdvancedOptions);
    hasJokerCheckbox.addEventListener('change', triggerAutoSearch);
    lengthFilter.addEventListener('change', triggerAutoSearch);
    sortByScoreCheckbox.addEventListener('change', triggerAutoSearch);
    
    // Écouteurs pour le changement de langue
    frOption.addEventListener('click', function() {
        setLanguage('francais');
        console.log('Langue changée pour : français');
        if (letterInput.value.trim().length > 0) {
            triggerAutoSearch();
        }
    });
    
    enOption.addEventListener('click', function() {
        setLanguage('english');
        console.log('Langue changée pour : anglais');
        if (letterInput.value.trim().length > 0) {
            triggerAutoSearch();
        }
    });
    
    // Charger les dictionnaires au démarrage
    loadDictionaries();
    
    // Fonction pour charger les dictionnaires
    function loadDictionaries() {
        statusIcon.textContent = '⏳';
        loadingStatus.textContent = "Chargement des dictionnaires...";
        
        // Charger le dictionnaire français
        fetch('francais.dic')
            .then(response => response.text())
            .then(text => {
                // Filtrer les lignes pour ne garder que les mots (après la section [Words])
                const lines = text.split('\n');
                let inWordsSection = false;
                const words = [];
                
                for (const line of lines) {
                    if (line.trim() === '[Words]') {
                        inWordsSection = true;
                        continue;
                    }
                    
                    if (inWordsSection && line.trim() && !line.startsWith('[')) {
                        words.push(line.trim().toUpperCase());
                    }
                }
                
                dictFr = words;
                console.log(`Dictionnaire français chargé: ${words.length} mots`);
                updateDictionaryStatus();
            })
            .catch(error => {
                console.error('Erreur lors du chargement du dictionnaire français:', error);
                loadingStatus.textContent = "Erreur de chargement du dictionnaire français";
            });
        
        // Charger le dictionnaire anglais
        fetch('english.dic')
            .then(response => response.text())
            .then(text => {
                // Filtrer les lignes pour ne garder que les mots (après la section [Words])
                const lines = text.split('\n');
                let inWordsSection = false;
                const words = [];
                
                for (const line of lines) {
                    if (line.trim() === '[Words]') {
                        inWordsSection = true;
                        continue;
                    }
                    
                    if (inWordsSection && line.trim() && !line.startsWith('[')) {
                        // Pour le dictionnaire anglais, extraire le mot avant le signe '='
                        const wordPart = line.includes('=') ? line.split('=')[0].trim() : line.trim();
                        words.push(wordPart.toUpperCase());
                    }
                }
                
                dictEn = words;
                console.log(`Dictionnaire anglais chargé: ${words.length} mots`);
                updateDictionaryStatus();
            })
            .catch(error => {
                console.error('Erreur lors du chargement du dictionnaire anglais:', error);
                loadingStatus.textContent = "Erreur de chargement du dictionnaire anglais";
            });
    }
    
    // Mettre à jour le statut des dictionnaires
    function updateDictionaryStatus() {
        if (dictFr.length > 0 && dictEn.length > 0) {
            statusIcon.textContent = '✓';
            loadingStatus.textContent = `Dictionnaires chargés: Français (${dictFr.length} mots), Anglais (${dictEn.length} mots)`;
            dictionaryStats.textContent = `Français (${dictFr.length} mots), Anglais (${dictEn.length} mots)`;
        } else if (dictFr.length > 0) {
            statusIcon.textContent = '⏳';
            loadingStatus.textContent = `Dictionnaire français chargé (${dictFr.length} mots), chargement de l'anglais...`;
        } else if (dictEn.length > 0) {
            statusIcon.textContent = '⏳';
            loadingStatus.textContent = `Dictionnaire anglais chargé (${dictEn.length} mots), chargement du français...`;
        }
    }
    
    // Fonction pour définir la langue active
    function setLanguage(lang) {
        // Si on change pour la même langue, ne rien faire
        if (currentLanguage === lang) {
            console.log(`Langue déjà définie à ${lang}`);
            return;
        }
        
        currentLanguage = lang;
        
        if (lang === 'francais') {
            frOption.classList.add('active');
            enOption.classList.remove('active');
        } else if (lang === 'english') {
            frOption.classList.remove('active');
            enOption.classList.add('active');
        } else {
            console.error(`Langue non reconnue: ${lang}`);
            return;
        }
        
        // Pour debug
        console.log(`Langue changée à: ${currentLanguage}`);
        console.log(`Dictionnaire français: ${dictFr.length} mots`);
        console.log(`Dictionnaire anglais: ${dictEn.length} mots`);
        
        // Mettre à jour les tuiles des lettres avec les nouvelles valeurs de points
        updateLetterTiles();
    }
    
    // Mettre à jour les tuiles de lettres affichées (désactivé selon demande)
    function updateLetterTiles() {
        // Ne rien afficher comme demandé
        letterTiles.innerHTML = '';
    }
    
    // Afficher/masquer les options avancées
    function toggleAdvancedOptions() {
        if (advancedOptions.style.display === 'none') {
            advancedOptions.style.display = 'block';
            advancedOptionsToggle.textContent = 'Masquer les options avancées';
        } else {
            advancedOptions.style.display = 'none';
            advancedOptionsToggle.textContent = 'Afficher les options avancées';
        }
    }
    
    // Calculer le score d'un mot
    function calculateWordScore(word) {
        const scores = currentLanguage === 'francais' ? letterScoresFR : letterScoresEN;
        let score = 0;
        
        for (const letter of word) {
            score += scores[letter] || 0;
        }
        
        return score;
    }
    
    // Rechercher les mots possibles
    function searchWords() {
        const inputValue = letterInput.value.trim().toUpperCase();
        
        // Compter le nombre de jokers (?) dans la saisie
        const jokerCount = (inputValue.match(/\?/g) || []).length;
        
        // Retirer les ? pour le test de validité et la recherche
        const letters = inputValue.replace(/\?/g, '');
        
        // Debug pour le dictionnaire
        console.log(`Recherche en cours avec la langue: ${currentLanguage}`);
        const dictSize = currentLanguage === 'francais' ? dictFr.length : dictEn.length;
        console.log(`Taille du dictionnaire actuel: ${dictSize} mots`);
        
        // Vérifier que les lettres sont valides (A-Z et éventuellement ?)
        if (!/^[A-Z]{0,21}$/.test(letters) || letters.length + jokerCount === 0 || letters.length + jokerCount > 21) {
            showError("Veuillez entrer des lettres valides (A-Z et ? pour les jokers)");
            return;
        }
        
        try {
            errorMessage.style.display = 'none';
            loadingIndicator.style.display = 'block';
            wordList.innerHTML = '';
            
            // Vérifier que les dictionnaires sont chargés
            if ((currentLanguage === 'francais' && dictFr.length === 0) || 
                (currentLanguage === 'english' && dictEn.length === 0)) {
                showError(`Le dictionnaire ${currentLanguage === 'francais' ? 'français' : 'anglais'} n'est pas encore chargé`);
                loadingIndicator.style.display = 'none';
                return;
            }
            
            // Délai artificiel pour permettre l'affichage de l'indicateur de chargement
            setTimeout(() => {
                try {
                    // Trouver les mots possibles
                    let dictionary;
                    if (currentLanguage === 'francais') {
                        dictionary = dictFr;
                        console.log(`Utilisation du dictionnaire français avec ${dictFr.length} mots`);
                    } else {
                        dictionary = dictEn;
                        console.log(`Utilisation du dictionnaire anglais avec ${dictEn.length} mots`);
                    }
                    console.log(`Recherche de mots avec les lettres: "${letters}" et ${jokerCount} jokers`);
                    
                    // Utiliser le nombre de jokers détecté au lieu de la checkbox
                    const results = findWordsWithLetters(dictionary, letters, jokerCount, null);
                    
                    // Trier les résultats selon le mode choisi (mot ou score)
                    if (sortByWord) {
                        // Tri alphabétique
                        results.sort((a, b) => a.localeCompare(b));
                    } else if (sortByScoreCheckbox.checked) {
                        // Tri par score décroissant
                        results.sort((a, b) => calculateWordScore(b) - calculateWordScore(a));
                    } else {
                        // Tri par longueur puis alphabétique
                        results.sort((a, b) => b.length - a.length || a.localeCompare(b));
                    }
                    
                    // Afficher les résultats
                    displayResults(results);
                } catch (error) {
                    console.error('Erreur lors de la recherche :', error);
                    showError("Erreur lors de la recherche : " + error.message);
                } finally {
                    loadingIndicator.style.display = 'none';
                }
            }, 100);
            
        } catch (error) {
            console.error('Erreur lors de la recherche :', error);
            showError("Erreur lors de la recherche : " + error.message);
            loadingIndicator.style.display = 'none';
        }
    }
    
    // Trouver les mots avec les lettres données
    function findWordsWithLetters(dictionary, letters, jokers, lengthFilter) {
        if (!dictionary || dictionary.length === 0) {
            console.error("Dictionnaire vide ou non défini");
            return [];
        }
        
        // Compter les occurrences de chaque lettre
        const availableLetters = {};
        for (const letter of letters) {
            availableLetters[letter] = (availableLetters[letter] || 0) + 1;
        }
        
        // Utiliser le nombre de jokers passé directement
        const jokerCount = jokers || 0;
        
        // Résultats
        const results = [];
        let processed = 0;
        
        // Vérifier chaque mot du dictionnaire
        for (const word of dictionary) {
            processed++;
            
            // Debug occasionnel pour vérifier le progrès
            if (processed % 50000 === 0) {
                console.log(`Traitement en cours: ${processed}/${dictionary.length} mots examinés`);
            }
            
            // Appliquer le filtre de longueur optionnel
            if (lengthFilter && parseInt(lengthFilter) > 0) {
                if (word.length !== parseInt(lengthFilter)) {
                    continue;
                }
            }
            
            // Vérifier si le mot peut être formé
            if (canFormWord(word, {...availableLetters}, jokerCount)) {
                results.push(word);
            }
        }
        
        console.log(`Recherche terminée: ${results.length} mots trouvés sur ${processed} mots examinés`);
        return results;
    }
    
    // Vérifier si un mot peut être formé avec les lettres disponibles
    function canFormWord(word, availableLetters, jokerCount) {
        if (!word || word.length === 0) {
            return false;
        }
        
        let jokersUsed = 0;
        
        for (const letter of word) {
            // Si on a la lettre disponible, l'utiliser
            if (availableLetters[letter] && availableLetters[letter] > 0) {
                availableLetters[letter]--;
            } else {
                // Sinon utiliser un joker si disponible
                jokersUsed++;
                // Si on n'a plus de jokers disponibles, le mot ne peut pas être formé
                if (jokersUsed > jokerCount) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    // Afficher les résultats de la recherche
    function displayResults(results) {
        wordList.innerHTML = '';
        
        if (results.length === 0) {
            resultsCount.textContent = "Aucun mot trouvé";
            return;
        }
        
        resultsCount.textContent = `${results.length} mot${results.length > 1 ? 's' : ''} trouvé${results.length > 1 ? 's' : ''}`;
        
        for (const word of results) {
            const score = calculateWordScore(word);
            
            const li = document.createElement('li');
            li.className = 'word-item';
            
            const wordSpan = document.createElement('span');
            wordSpan.className = 'word';
            wordSpan.textContent = word;
            
            const controlsDiv = document.createElement('div');
            controlsDiv.className = 'word-controls';
            
            const scoreSpan = document.createElement('span');
            scoreSpan.className = 'score';
            scoreSpan.textContent = score;
            
            // Lien vers Google pour la définition
            const googleLink = document.createElement('a');
            googleLink.className = 'google-link';
            googleLink.href = `https://www.google.com/search?q=${encodeURIComponent('définition ' + word)}`;
            googleLink.target = '_blank';
            googleLink.innerHTML = '<span class="definition-icon">📚</span>';
            
            // Lien pour vérifier si le mot est valide au Scrabble
            const validationLink = document.createElement('a');
            validationLink.className = 'scrabble-validation';
            
            // URL différente selon la langue
            if (currentLanguage === 'francais') {
                validationLink.href = `https://www.google.com/search?q=${encodeURIComponent(word + ' est valide au scrabble francophone')}`;
            } else {
                validationLink.href = `https://www.google.com/search?q=${encodeURIComponent(word + ' is valid in english scrabble')}`;
            }
            
            validationLink.target = '_blank';
            validationLink.innerHTML = '<span class="valid-icon">✓?</span>';
            
            controlsDiv.appendChild(scoreSpan);
            controlsDiv.appendChild(googleLink);
            controlsDiv.appendChild(validationLink);
            
            li.appendChild(wordSpan);
            li.appendChild(controlsDiv);
            
            wordList.appendChild(li);
        }
    }
    
    // Réinitialiser le formulaire
    function resetForm() {
        letterInput.value = '';
        hasJokerCheckbox.checked = false;
        lengthFilter.value = '';
        letterTiles.innerHTML = '';
        wordList.innerHTML = '';
        resultsCount.textContent = "Aucun résultat pour le moment";
        errorMessage.style.display = 'none';
    }
    
    // Afficher un message d'erreur
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }
});