// LISTE DE VOS COURS (Ajoutez vos futurs chapitres ici !)
const listeCours = [
    {
        categorie: "ecole",
        badge: "École • CM1 / CM2",
        titre: "Les homophones grammaticaux (a/à, et/est)",
        description: "Comprendre la différence entre le verbe et la préposition pour ne plus faire de fautes en dictée.",
        lienCours: "cours-modele.html",
        lienPdf: "#"
    },
    {
        categorie: "college",
        badge: "Collège • 4e / 3e",
        titre: "Les équations du premier degré",
        description: "La méthode pas à pas pour isoler l'inconnue x, avec 3 exercices progressifs et un sujet type Brevet.",
        lienCours: "cours-modele.html",
        lienPdf: "#"
    },
    {
        categorie: "lycee-gt",
        badge: "Lycée Général & Techno • 2nde / 1ère",
        titre: "Méthodologie : Réussir son commentaire composé",
        description: "Comment analyser un texte littéraire, bâtir un plan détaillé et rédiger une introduction efficace.",
        lienCours: "cours-modele.html",
        lienPdf: "#"
    },
    {
        categorie: "lycee-pro",
        badge: "Lycée Pro • 1ère / Terminale Bac Pro",
        titre: "Maths-Sciences : Les suites numériques",
        description: "Comprendre les suites arithmétiques et géométriques appliquées à des situations professionnelles.",
        lienCours: "cours-modele.html",
        lienPdf: "#"
    }
];

let categorieActuelle = "tous";

function afficherCours() {
    const container = document.getElementById("coursesContainer");
    const recherche = document.getElementById("searchInput").value.toLowerCase();
    container.innerHTML = "";

    const coursFiltres = listeCours.filter(cours => {
        const matchCategorie = (categorieActuelle === "tous") || (cours.categorie === categorieActuelle);
        const matchRecherche = cours.titre.toLowerCase().includes(recherche) || 
                               cours.badge.toLowerCase().includes(recherche) || 
                               cours.description.toLowerCase().includes(recherche);
        return matchCategorie && matchRecherche;
    });

    if (coursFiltres.length === 0) {
        container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #64748b; padding: 2rem;">Aucun cours trouvé pour cette recherche. Essayez un autre mot-clé !</p>`;
        return;
    }

    coursFiltres.forEach(cours => {
        const carte = `
            <div class="course-card">
                <div>
                    <span class="tag tag-${cours.categorie}">${cours.badge}</span>
                    <h3>${cours.titre}</h3>
                    <p>${cours.description}</p>
                </div>
                <div class="card-actions">
                    <a href="${cours.lienCours}" class="btn-card-main">Lire le cours</a>
                    <a href="${cours.lienPdf}" target="_blank" class="btn-card-pdf">📄 Contrôle PDF</a>
                </div>
            </div>
        `;
        container.innerHTML += carte;
    });
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

// Affiche les cours au chargement de la page
window.onload = afficherCours;
