const backendURL = "https://contador-dentes-backend.onrender.com/contar_dentes";

const fileInput = document.getElementById("fileInput");
const btnUpload = document.querySelector(".btnUpload");
const btnCamera = document.getElementById("btnCamera");
const btnEnviar = document.getElementById("btnEnviar");
const btnReset = document.getElementById("btnReset");
const fileName = document.getElementById("fileName");

const video = document.getElementById("video");
const canvas = document.getElementById("canvas");

const imagemInicial = document.getElementById("imagemInicial");
const imagemContada = document.getElementById("imagemContada");
const resultado = document.getElementById("resultado");
const resultContainer = document.getElementById("resultContainer");

let fotoCapturada = null;
let arquivoSelecionado = null;


// =========================
// UPLOAD DE ARQUIVO
// =========================
fileInput.onchange = () => {
    const file = fileInput.files[0];

    if (file) {
        arquivoSelecionado = file;
        fotoCapturada = null;

        fileName.innerText = "Arquivo selecionado: " + file.name;

        // Mostrar imagem inicial
        const reader = new FileReader();
        reader.onload = () => {
            imagemInicial.src = reader.result;
        };
        reader.readAsDataURL(file);

        btnUpload.style.display = "none";
        btnCamera.style.display = "none";
        btnReset.style.display = "inline-block";
    }
};


// =========================
// CAPTURA DE FOTO VIA CÂMERA
// =========================
btnCamera.onclick = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });

    video.srcObject = stream;
    video.style.display = "block";

    video.onclick = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0);

        canvas.toBlob((blob) => {
            fotoCapturada = blob;
            arquivoSelecionado = null;

            fileName.innerText = "Foto capturada";

            // Mostrar imagem inicial
            imagemInicial.src = URL.createObjectURL(blob);

            btnUpload.style.display = "none";
            btnCamera.style.display = "none";
            btnReset.style.display = "inline-block";
        }, "image/jpeg");

        stream.getTracks().forEach(track => track.stop());
        video.style.display = "none";
    };
};


// =========================
// ENVIO PARA O BACKEND
// =========================
btnEnviar.onclick = async () => {

    if (!arquivoSelecionado && !fotoCapturada) {
        alert("Selecione uma imagem ou tire uma foto.");
        return;
    }

    btnEnviar.disabled = true;
    btnEnviar.innerHTML = `<span class="spinner"></span> Contando dentes...`;

    const formData = new FormData();
    formData.append("file", arquivoSelecionado ? arquivoSelecionado : fotoCapturada);

    try {
        const response = await fetch(backendURL, {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        resultado.innerText = "Dentes detectados: " + data.dentes_detectados;

        imagemContada.src = "data:image/jpeg;base64," + data.imagem_processada;

        resultContainer.style.display = "block";

    } catch (error) {
        alert("Erro ao processar imagem.");
        console.error(error);
    }

    btnEnviar.disabled = false;
    btnEnviar.innerHTML = "Contar Dentes";
    // Esconde o botão de contar dentes
    btnEnviar.style.display = "none";

    // Mostra o botão de reset
    btnReset.style.display = "inline-block";

};


// =========================
// RESET
// =========================
btnReset.onclick = () => {
    arquivoSelecionado = null;
    fotoCapturada = null;

    fileInput.value = "";
    fileName.innerText = "";

    imagemInicial.src = "";
    imagemContada.src = "";
    resultado.innerText = "";
    resultContainer.style.display = "none";

    btnUpload.style.display = "inline-block";
    btnCamera.style.display = "inline-block";
    btnReset.style.display = "none";

    btnEnviar.disabled = false;
    btnEnviar.innerHTML = "Contar Dentes";
    // Mostra novamente o botão de contar dentes
    btnEnviar.style.display = "inline-block";

};
