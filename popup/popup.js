let IP = 'Bah alors ?'
async function getPublicIP() {
	const response = await fetch("https://api.ipify.org?format=json");
	const data = await response.json();
	return data.ip;
  }
  getPublicIP().then((ip) => {
	IP = ip;
  });
  

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
		console.log("Date non valide");
	}
});

document.addEventListener("click", () => {
	document.getElementById("content").style.display = 'flex';
	document.getElementById("message").innerText = IP;
});