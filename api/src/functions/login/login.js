const { app } = require('@azure/functions');

// ⚠️ Comentamos las importaciones problemáticas temporalmente
// const { executeQuery, testConnection } = require('../shared/database');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// require('dotenv').config();

app.http('login', {
    methods: ['GET', 'POST', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        try {
            context.log('🚀 Login function started - DEBUG VERSION');
            
            const corsHeaders = {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Max-Age': '86400'
            };

            // OPTIONS
            if (request.method === 'OPTIONS') {
                context.log('📋 Handling OPTIONS request');
                return {
                    status: 200,
                    headers: corsHeaders,
                    jsonBody: {}
                };
            }

            // GET para testing
            if (request.method === 'GET') {
                context.log('📋 Handling GET request');
                return {
                    status: 200,
                    headers: corsHeaders,
                    jsonBody: { 
                        message: '✅ Login API está funcionando (DEBUG MODE)',
                        timestamp: new Date().toISOString(),
                        method: request.method,
                        url: request.url,
                        // Información sobre dependencias
                        dependencies: {
                            '@azure/functions': 'loaded ✅',
                            // bcrypt: typeof bcrypt !== 'undefined' ? 'loaded ✅' : 'missing ❌',
                            // jsonwebtoken: typeof jwt !== 'undefined' ? 'loaded ✅' : 'missing ❌',
                            database: 'commented out for testing'
                        }
                    }
                };
            }

            // POST
            if (request.method === 'POST') {
                context.log('📋 Handling POST request');
                
                // Test básico sin dependencias
                let body;
                try {
                    body = await request.json();
                    context.log('📄 Body parsed successfully:', body);
                } catch (parseError) {
                    context.log('❌ Error parsing JSON:', parseError);
                    return {
                        status: 400,
                        headers: corsHeaders,
                        jsonBody: { 
                            error: 'Error parsing JSON', 
                            details: parseError.message 
                        }
                    };
                }

                const { email, password } = body;

                if (!email || !password) {
                    return {
                        status: 400,
                        headers: corsHeaders,
                        jsonBody: { error: 'Email y contraseña son requeridos' }
                    };
                }

                // Simulamos respuesta exitosa sin tocar la DB
                return {
                    status: 200,
                    headers: corsHeaders,
                    jsonBody: {
                        message: '✅ Login simulado exitoso (DEBUG MODE)',
                        received: { email, password: '***' },
                        timestamp: new Date().toISOString(),
                        note: 'Esta es una respuesta simulada para testing'
                    }
                };
            }

            return {
                status: 405,
                headers: corsHeaders,
                jsonBody: { error: 'Método no permitido' }
            };

        } catch (err) {
            context.log('❌ Error general en login:', err);
            return {
                status: 500,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                },
                jsonBody: { 
                    error: 'Error en el servidor', 
                    details: err.message,
                    stack: err.stack 
                }
            };
        }
    }
});