// Vercel detectará este archivo como una función sin servidor.
// El tipo de objeto 'request' puede variar según el framework, pero para Vercel es compatible con la API de Request/Response.

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ message: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { password } = await request.json();

    // Esta variable de entorno SÓLO existe en el servidor.
    // NO lleva el prefijo VITE_, por lo que nunca se expone al navegador.
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
        return new Response(JSON.stringify({ message: 'La configuración del servidor está incompleta.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    if (password === adminPassword) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      return new Response(JSON.stringify({ message: 'Contraseña incorrecta.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Error en el servidor.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}