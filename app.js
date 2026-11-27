import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC93Gl0vpSI_2spWQzG1JehIuNngmLCvIc",
  authDomain: "scolarix-f3eaa.firebaseapp.com",
  projectId: "scolarix-f3eaa",
  storageBucket: "scolarix-f3eaa.firebasestorage.app",
  messagingSenderId: "272463666273",
  appId: "1:272463666273:web:18c8f988d994e483361e20"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let tousLesCours = [];
let categorieActive = "tous";
let estAdmin = false;

onAuthStateChanged(auth, (user) => {
    estAdmin = !!user;
    const btnAjout = document.getElementById("btnAdminNav");
    const lienLogin = document.getElementById("lienConnexionAdmin");
    const lienLogout = document.getElementById("lienDeconnexionAdmin");

    if (btnAjout) btnAjout.style.display = estAdmin ? "inline-block" : "none";
    if (lienLogin) lienLogin.style.display = estAdmin ? "none" : "inline";
    if (lienLogout) lienLogout.style.display = estAdmin ? "inline" : "none";

    afficherCours();
});

window.connecterAdmin = async function() {
    const email = document.getElementById("adminEmail").value;
    const pass = document.getElementById("adminPass").value;
    try {
        await signInWithEmailAndPassword(auth, email, pass);
        window.fermerModales();
        alert("✅ Mode Admin activé ! Vous pouvez maintenant ajouter ou modifier vos cours directement sur le site.");
    } catch (e) {
        alert("Erreur de connexion : vérifiez votre e-mail et votre mot de passe.");
    }
};

window.deconnecterAdmin = async function() {
    await signOut(auth);
    alert("Mode Admin désactivé.");
};

async function chargerCours() {
    const container = document.getElementById("coursesContainer");
    try {
        const q = query(collection(db, "cours"), orderBy("date", "desc"));
        const snapshot = await getDocs(q);
        tousLesCours = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        afficherCours();
    } catch (e) {
        if (container) {
            container.innerHTML = `<p style="grid-column:1/-1; text-align:center; color:#64748b; padding:2rem;">Connectez-vous en Admin en bas de page pour publier votre tout premier cours !</p>`;
        }
    }
}

window.afficherCours = function() {
    const container = document.getElementById("coursesContainer");
    if (!container) return;

    const recherche = (document.getElementById("searchInput")?.value || "").toLowerCase();
    container.innerHTML = "";

    const filtres = tousLesCours.filter(c => {
        const matchCat = (categorieActive === "tous") || (c.categorie === categorieActive);
        const matchText = (c.titre || "").toLowerCase().includes(recherche) ||
                          (c.badge || "").toLowerCase().includes(recherche) ||
                          (c.description || "").toLowerCase().includes(recherche);
        return matchCat && matchText;
    });

    if (filtres.length === 0) {
        container.innerHTML = `<p style="grid-column:1/-1; text-align:center; color:#64748b; padding:2rem;">Aucun cours publié dans cette catégorie pour le moment.</p>`;
        return;
    }

    filtres.forEach(cours => {
        const boutonPdf = (cours.lienpdf && cours.lienpdf.startsWith("http"))
            ? `<a href="${cours.lienpdf}" target="_blank" class="btn-sm" style="background:#f1f5f9; color:#0f172a; border:1px solid #cbd5e1;">📄 PDF</a>`
            : "";

        const boutonsAdmin = estAdmin ? `
            <button class="btn-sm" style="background:#f59e0b; color:white;" onclick="ouvrirModaleEdition('${cours.id}')">✏️ Modifier</button>
            <button class="btn-sm" style="background:#ef4444; color:white;" onclick="supprimerCours('${cours.id}')">🗑️</button>
        ` : "";

        container.innerHTML += `
            <div class="course-card">
                <div>
                    <span class="tag tag-${cours.categorie}">${cours.badge}</span>
                    <h3>${cours.titre}</h3>
                    <p style="color:#64748b; font-size:0.95rem; margin-top:0.5rem;">${cours.description}</p>
                </div>
                <div class="card-actions">
                    <a href="cours.html?id=${cours.id}" class="btn-sm" style="background:#1d4ed8; color:white; flex:1; text-align:center;">Lire le cours</a>
                    ${boutonPdf}
                    ${boutonsAdmin}
                </div>
            </div>
        `;
    });
};

window.changerCategorie = function(cat, btn) {
    categorieActive = cat;
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    if (btn) btn.classList.add("active");
    afficherCours();
};

window.filtrerParMenu = function(cat, motCle = "") {
    categorieActive = cat;
    const input = document.getElementById("searchInput");
    if (input) input.value = motCle;
    afficherCours();
};

window.ouvrirModaleAjout = function() {
    document.getElementById("modalCoursTitre").innerText = "Publier un nouveau cours";
    document.getElementById("editCoursId").value = "";
    document.getElementById("cBadge").value = "";
    document.getElementById("cTitre").value = "";
    document.getElementById("cDesc").value = "";
    document.getElementById("cLecon").value = "";
    document.getElementById("cExercices").value = "";
    document.getElementById("cCorriges").value = "";
    document.getElementById("cPdf").value = "";
    document.getElementById("modalCours").style.display = "flex";
};

window.ouvrirModaleEdition = function(id) {
    const c = tousLesCours.find(item => item.id === id);
    if (!c) return;
    document.getElementById("modalCoursTitre").innerText = "Modifier le cours";
    document.getElementById("editCoursId").value = id;
    document.getElementById("cCategorie").value = c.categorie;
    document.getElementById("cBadge").value = c.badge;
    document.getElementById("cTitre").value = c.titre;
    document.getElementById("cDesc").value = c.description;
    document.getElementById("cLecon").value = c.lecon;
    document.getElementById("cExercices").value = c.exercices;
    document.getElementById("cCorriges").value = c.corriges;
    document.getElementById("cPdf").value = c.lienpdf || "";
    document.getElementById("modalCours").style.display = "flex";
};

window.sauvegarderCours = async function() {
    const id = document.getElementById("editCoursId").value;
    const data = {
        categorie: document.getElementById("cCategorie").value,
        badge: document.getElementById("cBadge").value,
        titre: document.getElementById("cTitre").value,
        description: document.getElementById("cDesc").value,
        lecon: document.getElementById("cLecon").value,
        exercices: document.getElementById("cExercices").value,
        corriges: document.getElementById("cCorriges").value,
        lienpdf: document.getElementById("cPdf").value,
        date: Date.now()
    };

    if (!data.titre || !data.lecon) {
        alert("Veuillez remplir au moins le titre et la leçon.");
        return;
    }

    try {
        if (id) {
            await updateDoc(doc(db, "cours", id), data);
        } else {
            await addDoc(collection(db, "cours"), data);
        }
        window.fermerModales();
        chargerCours();
    } catch (e) {
        alert("Erreur lors de l'enregistrement : vérifiez vos règles Firestore dans Firebase.");
    }
};

window.supprimerCours = async function(id) {
    if (confirm("Supprimer définitivement ce cours ?")) {
        await deleteDoc(doc(db, "cours", id));
        chargerCours();
    }
};

chargerCours();
