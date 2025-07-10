import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Augment the ImportMeta interface to include Vite's env variables.
// This informs TypeScript about the shape of `import.meta.env`,
// resolving the type error without suppressing it with `any`.
declare global {
  interface ImportMeta {
    readonly env: {
      readonly VITE_SUPABASE_URL: string;
      readonly VITE_SUPABASE_ANON_KEY: string;
    }
  }
}


// NOTA: En un entorno de desarrollo como este (basado en Vite),
// las variables de entorno se acceden a través de `import.meta.env`.
// Vercel inyectará automáticamente las variables con prefijo VITE_ aquí.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;


if (!supabaseUrl || !supabaseAnonKey) {
    // Esto se mostrará en el navegador si las variables de entorno no están configuradas.
    const errorDiv = document.createElement('div');
    errorDiv.style.position = 'fixed';
    errorDiv.style.top = '0';
    errorDiv.style.left = '0';
    errorDiv.style.width = '100%';
    errorDiv.style.padding = '20px';
    errorDiv.style.backgroundColor = 'red';
    errorDiv.style.color = 'white';
    errorDiv.style.textAlign = 'center';
    errorDiv.style.zIndex = '10000';
    errorDiv.innerHTML = `
        <strong>Error de Configuración</strong>: <br/>
        Las variables de entorno <strong>VITE_SUPABASE_URL</strong> y <strong>VITE_SUPABASE_ANON_KEY</strong> son obligatorias. <br/>
        Por favor, asegúrate de que estén configuradas en tu proyecto de Vercel y que tengan el prefijo "VITE_". El despliegue podría tardar unos momentos en reflejar los cambios.
    `;
    document.body.prepend(errorDiv);

    throw new Error("Supabase URL and Anon Key are required. In a Vite-like environment, they must be accessed via `import.meta.env` and prefixed with VITE_. Ensure they are set in your Vercel project settings.");
}


export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);