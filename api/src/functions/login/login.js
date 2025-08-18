const { app } = require('@azure/functions');
const { executeQuery, testConnection } = require('../shared/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

app.http('login', {
    methods: ['GET', 'POST', 'OPTIONS'], // ✅ Agregar GET para testing
    authLevel: 'anonymous',
    handler: async (request, context) => {
        try {
            // 🔹 Headers de CORS
            const corsHeaders = {
                'Access-Control-Allow-Origin': 'http://localhost:5173',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Max-Age': '86400'
            };

            // 🔹 Manejar preflight request (OPTIONS)
            if (request.method === 'OPTIONS') {
                return {
                    status: 200,
                    headers: corsHeaders,
                    jsonBody: {}
                };
            }

            // 🔹 Manejar GET request para testing
            if (request.method === 'GET') {
                return {
                    status: 200,
                    headers: corsHeaders,
                    jsonBody: { 
                        message: 'Login API está funcionando',
                        methods: ['POST'],
                        endpoint: '/api/login',
                        example: {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: { 
                                email: 'usuario@ejemplo.com', 
                                password: 'tu_contraseña' 
                            }
                        }
                    }
                };
            }

            // 🔹 Solo POST llega hasta aquí
            if (request.method !== 'POST') {
                return {
                    status: 405,
                    headers: corsHeaders,
                    jsonBody: { error: 'Método no permitido. Usa POST para login.' }
                };
            }

            // 🔹 Verificar conexión a la BD
            await testConnection();

            // 🔹 Obtener datos del body
            const body = await request.json();
            const { email, password } = body;

            if (!email || !password) {
                return {
                    status: 400,
                    headers: corsHeaders,
                    jsonBody: { error: 'Email y contraseña son requeridos' }
                };
            }

            // 🔹 Consulta a la tabla usuario
            const query = `
              SELECT id_usuario, correo_institucional, contrasena_cifrada, tipo_usuario
               FROM usuario
               WHERE correo_institucional = $1
            `;
            const result = await executeQuery(query, [email]);

            if (result.rows.length === 0) {
                return {
                    status: 401,
                    headers: corsHeaders,
                    jsonBody: { error: 'Usuario no encontrado' }
                };
            }

            const user = result.rows[0];

            // 🔹 Validar contraseña con bcrypt
            const match = await bcrypt.compare(password, user.contrasena_cifrada);
            if (!match) {
                return {
                    status: 401,
                    headers: corsHeaders,
                    jsonBody: { error: 'Contraseña incorrecta' }
                };
            }

            // 🔹 Generar JWT con información del usuario
            const token = jwt.sign(
                {
                    id: user.id_usuario,
                    email: user.correo_institucional,
                    tipo: user.tipo_usuario
                },
                process.env.JWT_SECRET || 'mi_clave_secreta',
                { expiresIn: '2h' }
            );

            // 🔹 Respuesta exitosa
            return {
                status: 200,
                headers: corsHeaders,
                jsonBody: {
                    message: 'Login exitoso',
                    token,
                    usuario: {
                        id: user.id_usuario,
                        email: user.correo_institucional,
                        tipo: user.tipo_usuario
                    }
                }
            };

        } catch (err) {
            context.log('❌ Error en login:', err);
            return {
                status: 500,
                headers: {
                    'Access-Control-Allow-Origin': 'http://localhost:5173',
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                },
                jsonBody: { error: 'Error en el servidor', details: err.message }
            };
        }
    }
});