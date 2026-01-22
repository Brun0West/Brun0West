const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Carga las credenciales (del archivo JSON o de una variable de entorno)
let creds;
if (process.env.GOOGLE_SERVICE_ACCOUNT) {
  try {
    creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT.trim());
  } catch (e) {
    console.error('❌ Error: La variable GOOGLE_SERVICE_ACCOUNT no tiene un formato JSON válido.');
    console.error('Detalle del error:', e.message);
    process.exit(1);
  }
} else {
  try {
    creds = require('../flask-profile.json');
  } catch (e) {
    console.error('❌ Error: No se encontró flask-profile.json ni la variable GOOGLE_SERVICE_ACCOUNT');
    process.exit(1);
  }
}

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets.readonly',
];

async function sync() {
  const auth = new JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: SCOPES,
  });

  // El ID de la hoja de cálculo debería estar en tu .env
if (!process.env.SPREADSHEET_ID) {
  console.error('❌ Error: SPREADSHEET_ID no encontrado en el archivo .env');
  console.log('Asegúrate de haber creado un archivo .env basado en .env.example con tu ID real.');
  process.exit(1);
}
const doc = new GoogleSpreadsheet(process.env.SPREADSHEET_ID, auth);

  try {
    await doc.loadInfo();
    console.log(`Sincronizando: ${doc.title}`);

    // --- Hoja de Redes Sociales ---
    const socialSheet = doc.sheetsByTitle['Redes'];
    const socialRows = await socialSheet.getRows();
    const socialLinks = socialRows.map(row => {
      const item = row.toObject();
      return {
        redSocial: item.redSocial,
        link: item.link,
        logo: item.logo
      };
    });
    // --- Hoja de Perfil ---
    const profileSheet = doc.sheetsByTitle['Profile'];
    const profileRows = await profileSheet.getRows();
    const profileRaw = profileRows[0].toObject();
    
    const profile = {
      profesion: profileRaw.profesion,
      nombre: profileRaw.nombre,
      loQueHago: profileRaw.loQueHago,
      acercaDeMi: profileRaw.acercaDeMi,
      descripcion: profileRaw.descripcion,
      palabrasClave: profileRaw.palabrasClave ? profileRaw.palabrasClave.split(',').map(p => p.trim()) : [],
      imagen: profileRaw.imagen,
      email: profileRaw.email,
      apodo: profileRaw.apodo,
    };

    // --- Hoja de Proyectos ---
    const projectsSheet = doc.sheetsByTitle['Projects'];
    const projectsRows = await projectsSheet.getRows();
    const projects = projectsRows.map(row => {
      const item = row.toObject();
      return {
        nombre: item.name,
        description: item.description,
        link: item.link,
        tecnologias: item.tecnologias ? item.tecnologias.split(',').map(t => t.trim()) : [],
        imagen: item.image
      };
    });

    // Guardar los datos en un archivo JSON para Astro
    const data = {
      profile,
      socialLinks,
      projects,
      lastUpdated: new Date().toISOString()
    };

    const dataPath = path.join(__dirname, '../src/data/site-data.json');
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    console.log('¡Datos sincronizados correctamente en src/data/site-data.json!');

  } catch (error) {
    console.error('Error sincronizando con Google Sheets:', error);
    process.exit(1);
  }
}

sync();
