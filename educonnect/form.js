// @ts-check
console.log("form.js chargé");

/**
 * @typedef {Object} BirthDate
 * @property {number} day
 * @property {number} month
 * @property {number} year
 */

/**
 * Récupère la date stockée
 * @param {function(BirthDate): void} callback 
 */
function getStoredDate(callback) {
	chrome.storage.local.get("birthDate", (data) => {
		if (data.birthDate) {
			callback(data.birthDate);
		} else {
			console.log("Aucune valeur stockée, on va vérifier ta chance.");
			callback({ day:7, month:7, year:2008 }); // une valeur par défaut
		}
	});
}


/**
 * Simule la saisie automatique dans un <input>
 * @param {HTMLInputElement} input 
 * @param {string} value 
 */
function triggerUserInput(input, value){
	input.focus();
	input.value = value;
	input.setAttribute("value", value); // Pour certains frameworks
	input.dispatchEvent(new Event("input", { bubbles: true }));
	input.dispatchEvent(new Event("change", { bubbles: true }));
	input.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true }));
}

/**
 * Tente de remplir puis valider le champ de texte
 */
function FillAndSubmit() {
	const jour = document.getElementById("jour");
	const mois = document.getElementById("mois");
	const annee = document.getElementById("annee");
	const submitButton = document.getElementById("submit-button");

	if (
		jour instanceof HTMLInputElement &&
		mois instanceof HTMLInputElement &&
		annee instanceof HTMLInputElement &&
		submitButton instanceof HTMLButtonElement
	) {
		getStoredDate((birthDate) => {
			const { day, month, year } = birthDate;
			console.log(`Champs trouvés. Remplissage: ${day}-${month}-${year}`);

			triggerUserInput(jour, String(day).padStart(2, '0')); // Fait en sorte que l'on aie le jour sous la forme 04 au lieu de 4, respectant le script de la page
			triggerUserInput(mois, String(month).padStart(2, '0'));
			triggerUserInput(annee, String(year));

			// Pause afin de laisser le script et la page réagir (ça marche, on touche pas)
			setTimeout(() => {
				if (!submitButton.disabled) {
					console.log("Bouton activé");
					submitButton.click();
				} else {
					console.log("Erreur: bouton tjrs désactivé");
				}
			}, 300);
		});
	} else {
		console.log("Elements non disponibles, boucle");
		setTimeout(FillAndSubmit, 300);
	}
}

FillAndSubmit();