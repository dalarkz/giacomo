// Default data
const defaultTributes = [
    {
        id: "1",
        name: "Ganja",
        birthDate: "2010-04-12",
        deathDate: "2023-08-05",
        photoUrl: "https://images.unsplash.com/photo-1543852786-1cf6624b9987?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        text: "Mon chat si doux et paisible. Tu adorais te prélasser au soleil sur le balcon pendant des heures. Ton ronronnement était la meilleure des thérapies. Tu nous manques chaque jour.",
        caresses: 14,
        comments: [
            { author: "Marie", text: "Un magnifique chat, de tout cœur avec vous." },
            { author: "Julien", text: "Courage, les souvenirs restent purs." }
        ]
    },
    {
        id: "2",
        name: "Max",
        birthDate: "2008-02-15",
        deathDate: "2022-11-20",
        photoUrl: "https://images.unsplash.com/photo-1544568100-847a948585b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        text: "Le chien le plus joyeux et loyal. Toujours prêt pour une promenade dans la forêt, peu importe la météo. Tu as été le meilleur ami que l'on puisse espérer.",
        caresses: 28,
        comments: [
            { author: "Sophie", text: "Repose en paix petit Max." }
        ]
    },
    {
        id: "3",
        name: "Plume",
        birthDate: "2018-06-01",
        deathDate: "2024-01-10",
        photoUrl: "https://images.unsplash.com/photo-1517331156700-3c241d2b4d83?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        text: "Petite boule de plumes partie trop tôt. Tes chants matinaux mettaient tant de vie dans la maison.",
        caresses: 5,
        comments: []
    }
];

// Initialize from localStorage
let tributes = [];
try {
    const saved = localStorage.getItem('paradis_tributes');
    if (saved) {
        tributes = JSON.parse(saved);
    } else {
        tributes = [...defaultTributes];
    }
} catch(e) {
    tributes = [...defaultTributes];
}

function saveTributes() {
    try {
        localStorage.setItem('paradis_tributes', JSON.stringify(tributes));
    } catch(e) {
        console.warn("Stockage plein, impossible de sauvegarder l'image.");
        alert("Attention : Vous avez atteint la limite de mémoire de votre navigateur (LocalStorage plein). Les prochains hommages ne s'enregistreront pas correctement tant que l'historique n'est pas vidé !");
    }
}

let currentTributeId = null;
let cropper = null;

// DOM Elements
const searchInput = document.getElementById('searchInput');
const tributesGrid = document.getElementById('tributesGrid');
const openCreateModalBtn = document.getElementById('openCreateModalBtn');
const closeCreateModalBtn = document.getElementById('closeCreateModal');
const createModal = document.getElementById('createModal');
const createTributeForm = document.getElementById('createTributeForm');
const photoUpload = document.getElementById('photoUpload');
const cropContainer = document.getElementById('cropContainer');
const imageToCrop = document.getElementById('imageToCrop');

const viewModal = document.getElementById('viewModal');
const closeViewModalBtn = document.getElementById('closeViewModal');
const memorialContent = document.getElementById('memorialContent');
const caressesCountText = document.getElementById('caressesCountText');
const giveCaresseBtn = document.getElementById('giveCaresseBtn');
const commentsList = document.getElementById('commentsList');
const commentForm = document.getElementById('commentForm');

// Utility: Format Date
function formatDate(dateString) {
    if (!dateString) return "?";
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
}

function getFallbackImage(name) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=E3CDC1&color=3E4B4B&size=400&font-size=0.33`;
}

// Render the grid of tributes
function renderTributes(filterQuery = '') {
    tributesGrid.innerHTML = '';
    
    let filtered = tributes;
    if (filterQuery) {
        filtered = tributes.filter(t => t.name.toLowerCase().includes(filterQuery.toLowerCase()));
    }
    
    // Reverse to show newest first
    const reversed = [...filtered].reverse();
    
    if (reversed.length === 0) {
        tributesGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--color-text-secondary);">Aucun hommage ne correspond à votre recherche.</p>';
        return;
    }
    
    reversed.forEach(tribute => {
        const imgUrl = tribute.photoUrl || getFallbackImage(tribute.name);
        
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-img-wrapper">
                <img src="${imgUrl}" alt="${tribute.name}" class="card-img">
            </div>
            <div class="card-content">
                <h4 class="pet-name">${tribute.name}</h4>
                <div class="pet-dates">${formatDate(tribute.birthDate)} - ${formatDate(tribute.deathDate)}</div>
                <p class="pet-excerpt">${tribute.text}</p>
            </div>
        `;
        
        card.addEventListener('click', () => openViewModal(tribute.id));
        
        tributesGrid.appendChild(card);
    });
}

// Search Logic
searchInput.addEventListener('input', (e) => {
    renderTributes(e.target.value);
});

// Upload and Crop Logic
photoUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            imageToCrop.src = event.target.result;
            cropContainer.style.display = 'block';
            
            if (cropper) {
                cropper.destroy();
            }
            
            cropper = new Cropper(imageToCrop, {
                aspectRatio: 4 / 3,
                viewMode: 1,
                autoCropArea: 1,
            });
        };
        reader.readAsDataURL(file);
    }
});

// Create Modal Logic
openCreateModalBtn.addEventListener('click', () => {
    createModal.classList.add('active');
});

closeCreateModalBtn.addEventListener('click', () => {
    createModal.classList.remove('active');
    createTributeForm.reset();
    if (cropper) {
        cropper.destroy();
        cropper = null;
    }
    cropContainer.style.display = 'none';
    imageToCrop.src = '';
});

createTributeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('petName').value;
    const birthDate = document.getElementById('birthDate').value;
    const deathDate = document.getElementById('deathDate').value;
    const text = document.getElementById('tributeText').value;
    
    let photoDataUrl = '';
    if (cropper) {
        photoDataUrl = cropper.getCroppedCanvas({
            maxWidth: 600,
            maxHeight: 600,
        }).toDataURL('image/jpeg', 0.7);
    }
    
    const newTribute = {
        id: Date.now().toString(),
        name,
        birthDate,
        deathDate,
        photoUrl: photoDataUrl,
        text,
        caresses: 0,
        comments: []
    };
    
    tributes.push(newTribute);
    saveTributes();
    renderTributes();
    
    createModal.classList.remove('active');
    createTributeForm.reset();
    if (cropper) {
        cropper.destroy();
        cropper = null;
    }
    cropContainer.style.display = 'none';
    imageToCrop.src = '';
    
    // Optionally open the newly created tribute
    openViewModal(newTribute.id);
});

// View Modal Logic
function openViewModal(id) {
    const tribute = tributes.find(t => t.id === id);
    if (!tribute) return;
    
    currentTributeId = id;
    
    const imgUrl = tribute.photoUrl || getFallbackImage(tribute.name);
    
    memorialContent.innerHTML = `
        <img src="${imgUrl}" alt="${tribute.name}" class="memorial-header-img">
        <div class="memorial-info">
            <h2 class="font-heading">${tribute.name}</h2>
            <div class="memorial-dates">
                ${tribute.birthDate ? formatDate(tribute.birthDate) + ' - ' : ''} ${formatDate(tribute.deathDate)}
            </div>
            <p class="memorial-text">${tribute.text}</p>
        </div>
    `;
    
    updateCaressesUI(tribute.caresses);
    renderComments(tribute);
    
    viewModal.classList.add('active');
}

closeViewModalBtn.addEventListener('click', () => {
    viewModal.classList.remove('active');
    currentTributeId = null;
    giveCaresseBtn.classList.remove('active');
});

// Click outside to close modals
window.addEventListener('click', (e) => {
    if (e.target === createModal) {
        createModal.classList.remove('active');
    }
    if (e.target === viewModal) {
        viewModal.classList.remove('active');
    }
});

// Interaction Logic
function updateCaressesUI(count) {
    caressesCountText.textContent = `${count} caresse${count > 1 ? 's' : ''}`;
}

giveCaresseBtn.addEventListener('click', () => {
    if (!currentTributeId) return;
    
    const tribute = tributes.find(t => t.id === currentTributeId);
    if (tribute && !giveCaresseBtn.classList.contains('active')) {
        tribute.caresses += 1;
        saveTributes();
        updateCaressesUI(tribute.caresses);
        giveCaresseBtn.classList.add('active');
        
        // Add small bouncing animation
        giveCaresseBtn.style.transform = "scale(1.2)";
        setTimeout(() => {
            giveCaresseBtn.style.transform = "";
        }, 200);
    }
});

function renderComments(tribute) {
    if (tribute.comments.length === 0) {
        commentsList.innerHTML = `<p class="comment-text" style="text-align:center; font-style:italic;">Soyez le premier à laisser un message.</p>`;
        return;
    }
    
    commentsList.innerHTML = tribute.comments.map(c => `
        <div class="comment">
            <span class="comment-author">${c.author}</span>
            <span class="comment-text">${c.text}</span>
        </div>
    `).join('');
    
    // Scroll to bottom of comments
    commentsList.scrollTop = commentsList.scrollHeight;
}

commentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!currentTributeId) return;
    
    const author = document.getElementById('commentAuthor').value;
    const text = document.getElementById('commentText').value;
    
    const tribute = tributes.find(t => t.id === currentTributeId);
    if (tribute) {
        tribute.comments.push({ author, text });
        saveTributes();
        renderComments(tribute);
        commentForm.reset();
    }
});

// Initial render
renderTributes();
