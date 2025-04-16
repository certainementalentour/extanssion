document.getElementById("saveDate").addEventListener("click", function () {
	const jour = document.getElementById("jour").value;
	const mois = document.getElementById("mois").value;
	const annee = document.getElementById("annee").value;

	if (jour && mois && annee) {
		const date = { day: jour, month: mois, year: annee };

		chrome.storage.local.set({ birthDate: date }, () => {
			console.log("Date de naissance enregistrée:", date);
		});
	} else {
		alert("Veuillez entrer une date valide.");
	}
});