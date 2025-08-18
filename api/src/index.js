// src/index.js
const { app } = require('@azure/functions');
const fs = require('fs');
const path = require('path');

app.setup({
    enableHttpStream: true,
});

//metodo para encontrar las funciones en subcarpetas dentro de functions
//se usa para cargar las funciones de manera modular
//cada carpeta dentro de functions representa una categoria de funciones
//por ejemplo: profesores, silabos, login, estudiantes, etc.
function loadFunctionsFromDir(dirPath, category) {
    const fullPath = path.join(__dirname, 'functions', dirPath);
    
    if (fs.existsSync(fullPath)) {
        console.log(`📁 Loading ${category} functions...`);
        
        fs.readdirSync(fullPath)
            .filter(file => file.endsWith('.js'))
            .forEach(file => {
                try {
                    require(`./functions/${dirPath}/${file}`);
                    console.log(`  ✅ ${file}`);
                } catch (error) {
                    console.error(`  ❌ Error loading ${file}:`, error.message);
                }
            });
    }
}

// Cargar por categorías ..
//añadir nuevas carpetas si se añaden nuevas funciones
loadFunctionsFromDir('profesores', 'Profesor');
loadFunctionsFromDir('silabos', 'Silabo');
loadFunctionsFromDir('login', 'log');
// loadFunctionsFromDir('estudiantes', 'Estudiante');

console.log('🚀 Function loading completed!');