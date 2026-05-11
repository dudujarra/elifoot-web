const fs = require('fs');
const path = require('path');

const shieldDir = '/Users/dudujarra/Documents/ELIFOOT/src/assets/shields/high_end';
const outputFile = '/Users/dudujarra/Documents/ELIFOOT/audit-escudos.html';

const files = fs.readdirSync(shieldDir).filter(f => f.endsWith('.png')).sort();

let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Auditoria de Escudos - Olé FUT</title>
    <style>
        body { font-family: system-ui, sans-serif; background: #1a1a1a; color: #fff; padding: 20px; }
        h1 { text-align: center; }
        .gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; padding: 20px; }
        .card { background: #2a2a2a; border-radius: 8px; padding: 10px; text-align: center; }
        .card img { max-width: 100%; height: auto; border-radius: 4px; border: 2px solid #444; transition: border-color 0.2s; }
        .card p { margin: 10px 0 0; font-size: 14px; font-weight: bold; word-break: break-all; }
        .bad { border-color: #ff4444 !important; border-width: 4px !important; }
        label { display: block; margin-top: 10px; cursor: pointer; user-select: none; }
        input[type=checkbox] { transform: scale(1.5); margin-right: 8px; }
    </style>
</head>
<body>
    <h1>Auditoria de Escudos (184 assets)</h1>
    <p style="text-align:center">Selecione os escudos que contêm Futebol Americano ou quebram as regras e clique em "Copiar Lista".<br>
    <strong>Dica:</strong> Copie e cole a lista pra mim no chat depois!</p>
    <div style="text-align:center; margin-bottom: 20px; position: sticky; top: 10px; z-index: 100;">
        <button onclick="copyList()" style="padding: 15px 30px; font-size: 18px; font-weight: bold; background: #4CAF50; color: white; border: none; border-radius: 8px; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
            Copiar Lista de Selecionados
        </button>
    </div>
    <div class="gallery">
`;

files.forEach(filename => {
    const relPath = `src/assets/shields/high_end/${filename}`;
    // Pré-marcar os que já achamos
    const isBad = ['abc.png', 'altos.png', 'bangu.png', 'boston_river.png', 'botafogo_sp.png'].includes(filename);
    const checkedHtml = isBad ? 'checked' : '';
    const badClass = isBad ? 'bad' : '';

    html += `
        <div class="card" id="card-${filename}">
            <img loading="lazy" src="${relPath}" alt="${filename}" id="img-${filename}" class="${badClass}">
            <p>${filename}</p>
            <label>
                <input type="checkbox" value="${filename}" onchange="toggleCard('${filename}', this.checked)" ${checkedHtml}> Refazer
            </label>
        </div>
    `;
});

html += `
    </div>
    <script>
        function toggleCard(filename, checked) {
            const img = document.getElementById('img-' + filename);
            if (checked) {
                img.classList.add('bad');
            } else {
                img.classList.remove('bad');
            }
        }
        function copyList() {
            const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
            const list = Array.from(checkboxes).map(cb => cb.value).join('\\n');
            navigator.clipboard.writeText(list).then(() => {
                alert(checkboxes.length + ' escudos copiados para a área de transferência! Cole no chat para o assistente.');
            }).catch(err => {
                // Fallback
                prompt('Não foi possível copiar automaticamente. Copie a lista abaixo:', list);
            });
        }
    </script>
</body>
</html>
`;

fs.writeFileSync(outputFile, html);
console.log('HTML Gerado com sucesso em ' + outputFile);
