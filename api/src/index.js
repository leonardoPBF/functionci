// src/index.js
const { app } = require('@azure/functions');
const fs = require('fs');
const path = require('path');

app.setup({
    enableHttpStream: true,
});

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

// Cargar por categorías
loadFunctionsFromDir('profesores', 'Profesor');
loadFunctionsFromDir('silabos', 'Silabo');
// loadFunctionsFromDir('estudiantes', 'Estudiante');

console.log('🚀 Function loading completed!');