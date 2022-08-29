const botaoMenu = document.querySelector(".button-menu");
const botaoEnviar = document.querySelector(".box ion-icon");
const menu = document.querySelector(".menu");
const visibilitys = document.querySelectorAll(".lock");
const voltar = document.querySelector(".back");
const input = document.querySelector(".input input");

let para = document.querySelector(".para");
let userOption = {firstTime: true, lastOption: undefined};
let visibilityOption = {firstTime: true, lastOption: undefined};
let usuarios = document.querySelectorAll(".contact li");

visibilityOption.lastOption = visibilitys[0].children[1];
userOption.lastOption       = usuarios[0].children[1];

let enter = document.querySelector(".login button");

let username;
enter.addEventListener("click", function(){
    username = document.querySelector(".login input").value;

    const enviaNome = axios.post("https://mock-api.bootcamp.respondeai.com.br/api/v6/uol/participants", {name: username});
    enviaNome.then(pegaMensagem);
    enviaNome.catch(outroNome);

    setInterval(function() {
        const geraParticipantes = axios.get("https://mock-api.bootcamp.respondeai.com.br/api/v6/uol/participants");
        geraParticipantes.then(carregarParticipantes);
    }, 10000);
    
    setInterval(function() {
        const sendStatus = axios.post("https://mock-api.bootcamp.respondeai.com.br/api/v6/uol/status", {name: username});
    }, 5000);

    setInterval(pegaMensagem, 3000);

});

function outroNome(error) {
    if(error.response.status === 400) {
        alert("Digite outro nome");
    }
};

function pegaMensagem() {
    let login = document.querySelector(".login .on");
    login.classList.add("off");
    let loading = document.querySelector(".loading");
    loading.classList.remove("off");
    promise = axios.get("https://mock-api.bootcamp.respondeai.com.br/api/v6/uol/messages");
    promise.then(carregarMSG);

};

function carregarMSG(response) {
    let telaLogin = document.querySelector(".login");
    telaLogin.classList.add("off");

    let messages = document.querySelector("main ul");
    messages.innerHTML = "";
    let dadoServidor = response.data;
    for(let i = 0; i < dadoServidor.length; i++) {
        if(dadoServidor[i].type === "status") {
            messages.innerHTML += 
            `<li class="leave">
                <span class="time">(${dadoServidor[i].time})</span>  <span class="name">${dadoServidor[i].from}</span> ${dadoServidor[i].text}
            </li>`
        } else if(dadoServidor[i].type === "message") {
            messages.innerHTML += 
            `<li class="public">
                <span class="time">(${dadoServidor[i].time})</span>  <span class="name">${dadoServidor[i].from}
                </span> para <span class="name">${dadoServidor[i].to}:</span>  ${dadoServidor[i].text}
            </li>`
        } else if(dadoServidor[i].to === username){
            messages.innerHTML += 
            `<li class="private">
                <span class="time">(${dadoServidor[i].time})</span>  <span class="name">${dadoServidor[i].from}
                </span> para <span class="name">${dadoServidor[i].to}:</span>  ${dadoServidor[i].text}
            </li>`
        };
    }
    messages = document.querySelector("main ul");
    if(!menu.classList.contains("on")) {
        messages.children[messages.children.length - 1].scrollIntoView();
    }
};

function carregarParticipantes(response) {
    const usuariosOnline = response.data;
    const listaUsuariosOnline = document.querySelector(".contact");
    listaUsuariosOnline.innerHTML = 
    `
    <li>
        <div class="user">
            <ion-icon name="people"></ion-icon> <span>Todos</span>
        </div>
        <div class="check">
            <ion-icon name="checkmark-sharp"></ion-icon>
        </div>
    </li>`;

    for(let i = 0; i < usuariosOnline.length; i++) {
        listaUsuariosOnline.innerHTML += 
        `
        <li>
            <div class="user">
                <ion-icon name="person-circle"></ion-icon> <span>${usuariosOnline[i].name}</span>
            </div>
            <div class="check">
                <ion-icon name="checkmark-sharp"></ion-icon>
            </div>
        </li>`
    };

    usuarios = document.querySelectorAll(".contact li");
    usuarios.forEach(user => {
        let userCheck = user.children[1];
        user.addEventListener("click", function () {
            checkOption(userOption, userCheck);
        });
    });

};


botaoMenu.addEventListener("click", function() {
    window.scroll(0, 0);
    mostraLogin(menu);
});

voltar.addEventListener("click", function(){
    escondeLogin(menu);
});

visibilitys.forEach(option => {
    let optionCheck = option.children[1];

    option.addEventListener("click", function () {
        checkOption(visibilityOption, optionCheck);
    });
});

botaoEnviar.addEventListener("click", enviarMensagem);
input.addEventListener("keypress", function(e){
    
    if(e.key === 'Enter')
        enviarMensagem();
});

function enviarMensagem() {
    const publica = visibilityOption.lastOption.parentNode.classList.contains("public-visibility");
    const messageTo = userOption.lastOption.parentNode.querySelector("span").innerHTML;

    let message = document.querySelector(".input input");
    let messageView = 'message';
    if(!publica || visibilityOption.lastOption === undefined) {
        messageView = 'private_message';
    }

    if(messageTo === undefined) {
        messageObject.to = "Todos";
    }
    
    let messageObject =         
    {
        from: username,
        to:   messageTo,
        text: message.value,
        type: messageView
    };

    const promise = axios.post("https://mock-api.bootcamp.respondeai.com.br/api/v6/uol/messages", messageObject);
    promise.then(pegaMensagem);
    promise.catch(carregarPagina);
    message.value = "";
};

function carregarPagina() {
    window.location.reload();
};

function paraQuemEAMsg() {
    const publica = visibilityOption.lastOption.parentNode.classList.contains("public-visibility");
    const userName = userOption.lastOption.parentNode.querySelector("span").innerHTML;
    if(publica === true) {
        para.innerHTML = `Enviando para ${userName} (publicamente)`;
    }   else {
        para.innerHTML = `Enviando para ${userName} (privadamente)`;
    }
};

function checkOption(optionType, option) {
    if(optionType.firstTime === true) {
        mostraLogin(option);
        optionType.lastOption = option;
        optionType.firstTime = false;
    } else if(option.classList.contains("on")) {
        return;
    } else {
        mostraLogin(option);
        escondeLogin(optionType.lastOption);
        optionType.lastOption = option;
    };
    if(!userOption.firstTime && !visibilityOption.firstTime) {
        paraQuemEAMsg();
    }
};

function mostraLogin(elemento) {
    elemento.classList.add("on");
};

function escondeLogin(elemento) {
    elemento.classList.remove("on");
};

setInterval(
    function() {
        let telaLogin = document.querySelector(".login");
        if(!(telaLogin.classList.contains("off"))) {
            window.scroll(0, 0);
        };   
}, 100);

/* N13 */
