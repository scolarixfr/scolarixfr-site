const URL_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQj0SiGrqGhyuoGr8ZrCfLAaudxp3ik_sXR5ZDS1r6NPQ8eQZuI2ofw7EpNt_IzdYgosZxK_luKLWsW/pub?output=csv";

let listeCours = [];
let categorieActuelle = "tous";

function parserCSV(texte) {
    const lignes = [];
    let ligneCourante = [];
    let cellule = "";
    let dansGuillemets = false;

    for (let i = 0; i < texte.length; i++) {
        const char = texte[i];
        const suivant = texte[i + 1];

        if (char === '"' && dansGuillemets && suivant === '"') {
            cellule += '"';
            i++;
        } else if (char === '"') {
            dansGuillemets = !dansGuillemets;
        } else if (char === ',' && !dansGuillemets) {
            ligneCourante.push(cellule.trim());
            cellule = "";
        } else if ((char === '\r' || char === '\n') && !dansGuillemets) {
            if (char === '\r' && suivant === '\n') i++;
            ligneCourante.push(cellule.trim());
            if (ligneCourante.some(c => c !== "")) lignes.push(ligneCourante);
            ligneCourante = [];
            cellule = "";
        } else {
            cellule += char;
        }
    }
    if (cellule !== "" || ligneCourante.length > 0) {
        ligneCourante.push(cellule.trim());
        lignes.push(ligneCourante);
    }

    const entetes = lignes[0];
    return lignes.slice(1).map(valeurs => {
        const objet = {};
        entetes.forEach((cle, index) => {
            objet[cle.toLowerCase()] = valeurs[index] || "";
        });
        return objet;
    });
}

async function chargerCoursDepuisSheet() {
    const container = document.getElementById("coursesContainer");
    if (container) {
        container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #64748b; padding: 2rem;">Chargement des cours Scolarix...</p>`;
    }

    try {
        const reponse = await fetch(URL_CSV);
        if (!reponse.ok) throw new Error("Erreur réseau");
        const texteCSV = await reponse.text();
        listeCours = parserCSV(texteCSV);
        
        if (container) afficherCours();
        if (typeof chargerPageUnique === "function") chargerPageUnique();
    } catch (erreur) {
        if (container) {
            container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #ef4444;">Impossible de charger les cours. Vérifiez votre connexion.</p>`;
        }
    }
}

function afficherCours() {
    const container = document.getElementById("coursesContainer");
    if (!container) return;

    const recherche = document.getElementById("searchInput").value.toLowerCase();
    container.innerHTML = "";

    listeCours.forEach((cours, index) => {
        const matchCategorie = (categorieActuelle === "tous") || (cours.categorie === categorieActuelle);
        const matchRecherche = (cours.titre || "").toLowerCase().includes(recherche) || 
                               (cours.badge || "").toLowerCase().includes(recherche) || 
                               (cours.description || "").toLowerCase().includes(recherche);

        if (matchCategorie && matchRecherche) {
            const boutonPdf = (cours.lienpdf && cours.lienpdf !== "#" && cours.lienpdf.startsWith("http")) 
                ? `<a href="${cours.lienpdf}" target="_blank" class="btn-card-pdf">📄 Contrôle PDF</a>` 
                : "";

            const carte = `
                <div class="course-card">
                    <div>
                        <span class="tag tag-${cours.categorie}">${cours.badge}</span>
                        <h3>${cours.titre}</h3>
                        <p>${cours.description}</p>
                    </div>
                    <div class="card-actions">
                        <a href="cours.html?id=${index}" class="btn-card-main">Lire le cours</a>
                        ${boutonPdf}
                    </div>
                </div>
            `;
            container.innerHTML += carte;
        }
    });

    if (container.innerHTML === "") {
        container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #64748b; padding: 2rem;">Aucun cours trouvé pour cette recherche.</p>`;
    }
}

function changerCategorie(cat, bouton) {
    categorieActuelle = cat;
    document.querySelectorAll(".filter-btn").forEach(btn => btn.classList.remove("active"));
    bouton.classList.add("active");
    afficherCours();
}

function filtrerCours() {
    afficherCours();
}

window.onload = chargerCoursDepuisSheet;
