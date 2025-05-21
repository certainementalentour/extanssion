// @ts-check

class ChocolatineTransformer {
	/** @type {number} */
	static MAX_TOKENS = 10000;  // Nb de tokens à partir duquel le script se coupe, afin de ne pas surcharger la machine

	/** @type {RegExp} */
	static RE_PAIN = /\b(un|une|le|la|mon|ton|son|notre|votre|leur|ce|du)\s+pain au chocolat\b/gi;

	/** @type {RegExp} */
	static RE_PAIN_NO_DET = /\bpain au chocolat\b/gi;

	/** @type {RegExp} */
	static RE_PAIN_PLURIEL = /\b((des|les|mes|tes|ses|nos|vos|leurs|quelques)?\s*)?pains au chocolat\b/gi;

	/** @type {RegExp} */
	static RE_CHOCOLATINE = /\bchocolatines?\b/gi;

	/** @type {string[]} */
	static BLACKLISTED_DOMAINS = [
//  'localhost', '.local'
//	'mail.google.com',
	'discord.com',
	'web.telegram.org',
	'github.com',
	'chat.openai.com',
	'chatgpt.com',
	'cacaboudin.fr',
	'bank',  // contenant 'bank'
	'banque',
	'paypal.com'
	];

	constructor() {
	if (this.isBlacklisted(window.location.hostname)) return;

		/** @type {number} */
		this.tokenCount = 0;

		/** @type {{pain_singulier:number, pain_sans_det:number, pain_pluriel:number, chocolatine:number}} */
		this.counts = {
			pain_singulier: 0,
			pain_sans_det: 0,
			pain_pluriel: 0,
			chocolatine: 0
		};

		if (document.body) this.walkDOM(document.body);

		console.info("ChocolatineTransformer - Résumé des remplacements :");
		console.info(`Pain au chocolat (avec déterminant) remplacés : ${this.counts.pain_singulier}`);
		console.info(`Pain au chocolat (sans déterminant) remplacés : ${this.counts.pain_sans_det}`);
		console.info(`Pains au chocolat (pluriel) remplacés : ${this.counts.pain_pluriel}`);
		console.info(`Occurrences de "chocolatine(s)" à l'initialisation : ${this.counts.chocolatine - this.counts.pain_pluriel - this.counts.pain_sans_det - this.counts.pain_singulier}`);
		console.info(`Occurrences de "chocolatine(s)" après traitement : ${this.counts.chocolatine}`);
	}

	/**
	 * Vérifie si le domaine est sous liste noire
	 * @param {string} hostname
	 * @returns {boolean}
	 */
	isBlacklisted(hostname) {
	return ChocolatineTransformer.BLACKLISTED_DOMAINS.some((blocked) => hostname.includes(blocked));
	}



	/**
	 * Parcourt le DOM récursivement sans freezer la page.
	 * @param {Node} root
	 */
	walkDOM(root) {
		const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
		const texts = [];

		let node = walker.nextNode();
		while (node && this.tokenCount < ChocolatineTransformer.MAX_TOKENS) {
			if (node instanceof Text && node.nodeValue && node.nodeValue.trim()) {
				texts.push(node);
				this.tokenCount += this.estimateTokens(node.nodeValue);
			}
			node = walker.nextNode();
		} 

		for (const textNode of texts) {
			this.replaceInTextNode(textNode);
		}
	}


	/**
	 * Estime le nombre de tokens (approximatif, basé sur les mots)
	 * @param {string} text
	 * @returns {number}
	 */
	estimateTokens(text) {
		return text.split(/\s+/).length;
	}

	/**
	 * Convertit le déterminant masculin vers la version féminine ou plurielle
	 * @param {string} det
	 * @param {"singulier" | "pluriel"} nb
	 * @returns {string}
	 */
	convertDet(det, nb) {
		const lower = det.toLowerCase().trim();

		const mapSingulier = {
      un: 'une',
      le: 'la',
      mon: 'ma',
      ton: 'ta',
      son: 'sa',
      notre: 'notre',
      votre: 'votre',
      leur: 'leur',
      ce: 'cette',
      du: 'de la'
    };

    const mapPluriel = {
      des: 'des',
      les: 'les',
      mes: 'mes',
      tes: 'tes',
      ses: 'ses',
      nos: 'nos',
      vos: 'vos',
      leurs: 'leurs',
      quelques: 'quelques'
    };

		const map = nb === 'singulier' ? mapSingulier : mapPluriel;
		const converted = map[lower] || lower;

		// Préserver approximativement la casse d'origine (détecter majuscules, capitalisé ou minuscule)
		if (det === det.toUpperCase()) {
      return converted.toUpperCase();
    } else if (det[0] === det[0].toUpperCase()) {
      return converted[0].toUpperCase() + converted.slice(1);
    } else {
      return converted;
    }
	}

	/**
	 * Remplace les occurrences et insère du HTML pour chocolatine.
	 * @param {Text} textNode
	 */
	replaceInTextNode(textNode) {
		const original = textNode.nodeValue;
		if (!original || !this.counts
			|| typeof this.counts.pain_singulier !== 'number'
			|| typeof this.counts.pain_sans_det !== 'number'
			|| typeof this.counts.pain_pluriel !== 'number'
			|| typeof this.counts.chocolatine !== 'number'
		) return;

		let replaced = original;

		// Avec déterminant
		replaced = replaced.replace(ChocolatineTransformer.RE_PAIN, (_match, det) => {
			const converted = det ? this.convertDet(det, 'singulier') : null;
			this.counts.pain_singulier++;
			const phrase = converted ? `${converted.toUpperCase()} CHOCOLATINE` : `CHOCOLATINE`;
			return this.wrapRedBlink(phrase);
		});

		// Sans déterminant
		replaced = replaced.replace(ChocolatineTransformer.RE_PAIN_NO_DET, () => {
			this.counts.pain_sans_det++;
			return this.wrapRedBlink(`CHOCOLATINE`);
		});

		// Pluriel avec ou sans déterminant
		replaced = replaced.replace(ChocolatineTransformer.RE_PAIN_PLURIEL, (_match, prefix) => {
			const converted = prefix ? this.convertDet(prefix, 'pluriel') : null;
			this.counts.pain_pluriel++;
			const phrase = converted ? `${converted.toUpperCase()} CHOCOLATINES` : `CHOCOLATINES`;
			return this.wrapRedBlink(phrase);
		});

		// Les "Chocolatine(s)" initialement présents dans la page
		replaced = replaced.replace(ChocolatineTransformer.RE_CHOCOLATINE, (match) => {
			this.counts.chocolatine++;
			return this.wrapRedBlink(match);
		});

		if (replaced === original) return;

		const span = document.createElement('span');
		span.innerHTML = replaced;

		if (textNode.parentNode) {
			textNode.parentNode.replaceChild(span, textNode);
		}
	}

	/**
	 * Entoure une expression en rouge + blink si supporté
	 * @param {string} content
	 * @returns {string}
	 */
	wrapRedBlink(content) {
		const styled = `<span style="color:red;">${content}</span>`;
		return this.supportsBlink() ? `<blink>${content}</blink>` : styled;
	}

	/**
	 * Vérifie si le navigateur supporte encore <blink>.
	 * @returns {boolean}
	 */
	supportsBlink() {
		// Blink est obsolète, on fait comme s'il était partiellement supporté
//		const test = document.createElement('blink');
//		return typeof test !== 'undefined';
		return 'HTMLBlinkElement' in window;
	}
}

// Démarrage (sauf si dans une iframe
if (window.top === window.self) {
	if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', () => new ChocolatineTransformer());
	} else {
	new ChocolatineTransformer();
	}
}
