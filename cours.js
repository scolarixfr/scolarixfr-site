const SHEET_ID = "1EDrFbP809dPVlK-j0tH9s6crxCmrDK1VelsDjdWDScI";
const URL_API = `https://elk.sh{SHEET_ID}/1`;

let listeCours = [];
let categorieActuelle = "tous";

async function chargerCoursDepuisSheet() {
    const container = document.getElementById("coursesContainer");
    if (container) {
        container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #64748b; padding: 2rem;">Chargement des cours Scolarix...</p>`;
    }

    try {
        const reponse = await fetch(URL_API);
        listeCours = await reponse.json();
        
        if (container) afficherCours();
        
        if (typeof chargerPageUnique === "function") {
            chargerPageUnique();
        }
    } catch (erreur) {
        if (container) {
            container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #ef4444;">Impossible de charger les cours. Vérifiez que le tableau est bien publié sur le Web.</p>`;
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
            const boutonPdf = (cours.lienPdf && cours.lienPdf !== "#" && cours.lienPdf.startsWith("http")) 
                ? `<a href="${cours.lienPdf}" target="_blank" class="btn-card-pdf">📄 Contrôle PDF</a>` 
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
