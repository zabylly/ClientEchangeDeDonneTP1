//<span class="cmdIcon fa-solid fa-ellipsis-vertical"></span>
let contentScrollPosition = 0;
Init_UI();

function Init_UI() {
    renderFavoris();
    renderCategories();
    $('#createFavori').on("click", async function () {
        saveContentScrollPosition();
        renderCreateFavoriForm();
    });
    $('#abort').on("click", async function () {
        renderFavoris();
    });



}

function renderAbout() {
    saveContentScrollPosition();
    eraseContent();
    $("#createFavori").hide();
    $("#abort").show();
    $("#actionTitle").text("À propos...");
    $("#content").append(
        $(`
            <div class="aboutContainer">
                <h2>Gestionnaire de favoris</h2>
                <hr>
                <p>
                    Petite application de gestion de favoris à titre de démonstration
                    d'interface utilisateur monopage réactive.
                </p>
                <p>
                    Auteur: Nicolas Chourot
                </p>
                <p>
                    Collège Lionel-Groulx, automne 2023
                </p>
            </div>
        `))
}
async function renderFavoris() {
    showWaitingGif();
    $("#actionTitle").text("Liste des favoris");
    $("#createFavori").show();
    $("#abort").hide();
    let favoris = await Favoris_API.Get();
    eraseContent();
    if (favoris !== null) {
        favoris.forEach(favori => {
            $("#content").append(renderFavori(favori));
        });
        restoreContentScrollPosition();
        // Attached click events on command icons
        $(".editCmd").on("click", function () {
            saveContentScrollPosition();
            renderEditFavoriForm(parseInt($(this).attr("editFavoriId")));
        });
        $(".deleteCmd").on("click", function () {
            saveContentScrollPosition();
            renderDeleteFavoriForm(parseInt($(this).attr("deleteFavoriId")));
        });
        $(".favoriRow").on("click", function (e) { e.preventDefault(); })
    } else {
        renderError("Service introuvable");
    }
}
async function renderFavorisCategory(category) {
    showWaitingGif();
    $("#actionTitle").text("Liste des favoris");
    $("#createFavori").show();
    $("#abort").hide();
    let favoris = await Favoris_API.Get();
    eraseContent();
    if (favoris !== null) {
        favoris.forEach(favori => {
            if(favori.Category == category)
                $("#content").append(renderFavori(favori));
        });
        restoreContentScrollPosition();
        // Attached click events on command icons
        $(".editCmd").on("click", function () {
            saveContentScrollPosition();
            renderEditFavoriForm(parseInt($(this).attr("editFavoriId")));
        });
        $(".deleteCmd").on("click", function () {
            saveContentScrollPosition();
            renderDeleteFavoriForm(parseInt($(this).attr("deleteFavoriId")));
        });
        $(".favoriRow").on("click", function (e) { e.preventDefault(); })
    } else {
        renderError("Service introuvable");
    }
}
async function renderCategories() {
    $("#categoryMenu").empty();
    let favoris = await Favoris_API.Get();
    let categories = favoris.map(favori => favori.Category);
    categories = [...new Set(categories)];//enlève les doublons
    console.log(categories);
    if (categories !== null) {
        categories.forEach(category => {
            $("#categoryMenu").append(renderCategory(category));
            $(`#${category}`).on("click", async function () {
                console.log(category);
                renderFavorisCategory(category);
            });
        });


    } else {
        renderError("Service introuvable");
    }
    $("#categoryMenu").append(`<div class="dropdown-item" id="aboutCmd">
        <i class="menuIcon fa fa-info-circle mx-2"></i> À propos...
    </div>`);
    $('#aboutCmd').on("click", function () {
        renderAbout();
    });
}
function showWaitingGif() {
    $("#content").empty();
    $("#content").append($("<div class='waitingGifcontainer'><img class='waitingGif' src='Loading_icon.gif' /></div>'"));
}
function eraseContent() {
    $("#content").empty();
}
function saveContentScrollPosition() {
    contentScrollPosition = $("#content")[0].scrollTop;
}
function restoreContentScrollPosition() {
    $("#content")[0].scrollTop = contentScrollPosition;
}
function renderError(message) {
    eraseContent();
    $("#content").append(
        $(`
            <div class="errorContainer">
                ${message}
            </div>
        `)
    );
}
function renderCreateFavoriForm() {
    renderFavoriForm();
}
async function renderEditFavoriForm(id) {
    showWaitingGif();
    let favori = await Favoris_API.Get(id);
    if (favori !== null)
        renderFavoriForm(favori);
    else
        renderError("Favori introuvable!");
}
async function renderDeleteFavoriForm(id) {
    showWaitingGif();
    $("#createFavori").hide();
    $("#abort").show();
    $("#actionTitle").text("Retrait");
    let favori = await Favoris_API.Get(id);
    eraseContent();
    if (favori !== null) {
        $("#content").append(`
        <div class="favorideleteForm">
            <h4>Effacer le favori suivant?</h4>
            <br>
            <div class="favoriRow" favori_id=${favori.Id}">
                <div class="favoriContainer">
                    <div class="favoriLayout">
                        <div class="favoriTitle">${favori.Title}</div>
                        <div class="favoriURL">${favori.URL}</div>
                        <div class="favoriCategory">${favori.Category}</div>
                    </div>
                </div>  
            </div>   
            <br>
            <input type="button" value="Effacer" id="deleteFavori" class="btn btn-primary">
            <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
        </div>    
        `);
        $('#deleteFavori').on("click", async function () {
            showWaitingGif();
            let result = await Favoris_API.Delete(favori.Id);
            if (result)
            {
                renderCategories();
                renderFavoris();
            }
            else
                renderError("Une erreur est survenue!");
        });
        $('#cancel').on("click", function () {
            renderFavoris();
        });
    } else {
        renderError("Favori introuvable!");
    }
}
function newFavori() {
    favori = {};
    favori.Id = 0;
    favori.Title = "";
    favori.URL = "";
    favori.Category = "";
    return favori;
}
function renderFavoriForm(favori = null) {
    $("#createFavori").hide();
    $("#abort").show();
    eraseContent();
    let create = favori == null;
    if (create) favori = newFavori();
    let imgUrl = 'favori-logo.svg';
    if(favori.URL) imgUrl = `http://www.google.com/s2/favicons?sz=64&domain=${favori.URL}`;
    
    $("#actionTitle").text(create ? "Création" : "Modification");
    $("#content").append(`
        <form class="form" id="favoriForm">
        <div class="big-favicon" id="imgURL"
        style="background-image: url('${imgUrl}');">
        </div>
            <input type="hidden" name="Id" value="${favori.Id}"/>

            <label for="Title" class="form-label">Titre </label>
            <input 
                class="form-control Alpha"
                name="Title" 
                id="Title" 
                placeholder="Nom"
                required
                RequireMessage="Veuillez entrer un titre"
                InvalidMessage="Le titre comporte un caractère illégal" 
                value="${favori.Title}"
            />
            <label for="URL" class="form-label">URL </label>
            <input
                class="form-control URL"
                name="URL"
                id="URL"
                placeholder="https://"
                required
                RequireMessage="Veuillez entrer un URL" 
                InvalidMessage="Veuillez entrer un URL valide"
                value="${favori.URL}" 
            />
            <label for="Category" class="form-label">Catégorie </label>
            <input 
                class="form-control Alpha"
                name="Category"
                id="Category"
                placeholder="Catégorie"
                required
                RequireMessage="Veuillez entrer une catégorie" 
                InvalidMessage="Veuillez entrer une catégorie valide"
                value="${favori.Category}"
            />
            <hr>
            <input type="submit" value="Enregistrer" id="saveFavori" class="btn btn-primary">
            <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
        </form>
    `);
    $('#URL').blur(function (){
        console.log($(this).val());
        $("#imgURL").css("background-image",`url('http://www.google.com/s2/favicons?sz=64&domain=${$(this).val()}')`)
    });
    initFormValidation();
    $('#favoriForm').on("submit", async function (event) {
        event.preventDefault();
        let favori = getFormData($("#favoriForm"));
        favori.Id = parseInt(favori.Id);
        showWaitingGif();
        let result = await Favoris_API.Save(favori, create);
        if (result)
        {
            renderCategories();
            renderFavoris();
        }
        else
            renderError("Une erreur est survenue!");
    });
    $('#cancel').on("click", function () {
        renderFavoris();
    });
}

function getFormData($form) {
    const removeTag = new RegExp("(<[a-zA-Z0-9]+>)|(</[a-zA-Z0-9]+>)", "g");
    var jsonObject = {};
    $.each($form.serializeArray(), (index, control) => {
        jsonObject[control.name] = control.value.replace(removeTag, "");
    });
    return jsonObject;
}

function renderFavori(favori) {
    return $(`
     <div class="favoriRow" favori_id=${favori.Id}">
        <div class="favoriContainer noselect">
            <div class="favoriLayout">
                <div>
                    <span class="small-favicon" id="imgURL"
                    style="background-image: url('http://www.google.com/s2/favicons?sz=64&domain=${favori.URL}');"></span>
                    <span class="favoriTitle">${favori.Title}</span>
                </div>
                <span class="favoriCategory">${favori.Category}</span>
            </div>
            
            <div class="favoriCommandPanel">
                <span class="editCmd cmdIcon fa fa-pencil" editFavoriId="${favori.Id}" title="Modifier ${favori.Title}"></span>
                <span class="deleteCmd cmdIcon fa fa-trash" deleteFavoriId="${favori.Id}" title="Effacer ${favori.Title}"></span>
            </div>
        </div>
    </div>           
    `);
}
function renderCategory(category)
{
    return $(`
    <div class="dropdown-item" id="${category}">
     ${category}
    </div>`);
}
