function validateInput(text, lang) {
    const validChars = lang === "russian" ? /^[а-яА-ЯёЁ\s]+$/ : /^[a-zA-Z\s]+$/;
    if (!validChars.test(text)) {
        alert(`Ошибка: текст содержит символы, не относящиеся к выбранному языку (${lang === "russian" ? "русский" : "английский"}).`);
        return false;
    }
    return true;
}

function createMatrix(key, lang) {
    const alphabet = lang === "russian" ? "абвгдежзийклмнопрстуфхцчшщъыьэюя" : "abcdefghijklmnopqrstuvwxyz";
    const uniqueKey = Array.from(new Set(key.replace(/[^a-zа-яё]/gi, "").toLowerCase()));
    const matrix = uniqueKey.concat(alphabet.split("").filter(char => !uniqueKey.includes(char)));
    return matrix.slice(0, lang === "russian" ? 36 : 25);
}

function displayMatrix(matrix, lang) {
    const matrixContainer = document.getElementById("matrix");
    matrixContainer.innerHTML = "";
    const size = lang === "russian" ? 6 : 5;
    matrix.forEach((char, index) => {
        const cell = document.createElement("div");
        cell.textContent = char.toUpperCase();
        matrixContainer.appendChild(cell);
    });
}

function processTextWithCase(text, matrix, lang, mode) {
    const size = lang === "russian" ? 6 : 5;
    let bigrams = [];
    let result = [];
    let lowerText = text.toLowerCase();
    let caseMap = Array.from(text).map(char => (char === char.toUpperCase() ? "U" : "L"));

    lowerText = lowerText.replace(/[^a-zа-яё]/gi, "").split("");

    for (let i = 0; i < lowerText.length; i += 2) {
        let a = lowerText[i];
        let b = lowerText[i + 1] || (lang === "russian" ? "ъ" : "x");
        if (a === b) b = lang === "russian" ? "ъ" : "x";
        bigrams.push([a, b]);
    }

    bigrams.forEach(([a, b]) => {
        let idxA = matrix.indexOf(a);
        let idxB = matrix.indexOf(b);

        if (idxA === -1 || idxB === -1) {
            result.push(a + b);
            return;
        }

        let rowA = Math.floor(idxA / size),
            colA = idxA % size;
        let rowB = Math.floor(idxB / size),
            colB = idxB % size;

        if (rowA === rowB) {
            colA = (colA + (mode === "encrypt" ? 1 : -1) + size) % size;
            colB = (colB + (mode === "encrypt" ? 1 : -1) + size) % size;
        } else if (colA === colB) {
            rowA = (rowA + (mode === "encrypt" ? 1 : -1) + size) % size;
            rowB = (rowB + (mode === "encrypt" ? 1 : -1) + size) % size;
        } else {
            [colA, colB] = [colB, colA];
        }

        result.push(matrix[rowA * size + colA] + matrix[rowB * size + colB]);
    });

    return result.join("").split("").map((char, index) => (caseMap[index] === "U" ? char.toUpperCase() : char)).join("");
}

function encryptText() {
    const key = document.getElementById("key").value;
    const text = document.getElementById("text").value;
    const lang = document.querySelector("input[name='language']:checked").value;

    if (!validateInput(text, lang)) return;

    const matrix = createMatrix(key, lang);
    displayMatrix(matrix, lang);
    const result = processTextWithCase(text, matrix, lang, "encrypt");
    document.getElementById("result").value = result;
}

function decryptText() {
    const key = document.getElementById("key").value;
    const text = document.getElementById("text").value;
    const lang = document.querySelector("input[name='language']:checked").value;

    if (!validateInput(text, lang)) return;

    const matrix = createMatrix(key, lang);
    displayMatrix(matrix, lang);
    const result = processTextWithCase(text, matrix, lang, "decrypt");
    document.getElementById("result").value = result;
}