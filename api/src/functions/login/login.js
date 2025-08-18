const { app } = require('@azure/functions');
const { executeQuery, testConnection } = require('../shared/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

app.http('login', {
    methods: ['GET', 'POST', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        try {
            context.log('🚀 Login function started - FULL VERSION');
            
            const corsHeaders = {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Max-Age': '86400'
            };

            // OPTIONS
            if (request.method === 'OPTIONS') {
                return {
                    status: 200,
                    headers: corsHeaders,
                    jsonBody: {}
                };
            }

            // GET para testing con validación de BD
            if (request.method === 'GET') {
                try {
                    await testConnection();
                    const dbStatus = '✅ BD conectada';
                    context.log('✅ Database connection successful');
                } catch (dbError) {
                    context.log('❌ Database connection failed:', dbError);
                    return {
                        status: 500,
                        headers: corsHeaders,
                        jsonBody: { 
                            message: '❌ Error de conexión a BD',
                            error: dbError.message,
                            timestamp: new Date().toISOString()
                        }
                    };
                }

                return {
                    status: 200,
                    headers: corsHeaders,
                    jsonBody: { 
                        message: '✅ Login API completamente funcional',
                        timestamp: new Date().toISOString(),
                        status: {
                            database: '✅ conectada',
                            bcrypt: '✅ disponible',
                            jwt: '✅ disponible',
                            env_vars: {
                                JWT_SECRET: process.env.JWT_SECRET ? '✅ configurado' : '❌ faltante'
                            }
                        }
                    }
                };
            }

            // POST - Login real
            if (request.method === 'POST') {
                context.log('📋 Processing POST login request');
                
                // Verificar conexión a la BD primero
                try {
                    await testConnection();
                    context.log('✅ Database connection verified');
                } catch (dbError) {
                    context.log('❌ Database connection failed:', dbError);
                    return {
                        status: 500,
                        headers: corsHeaders,
                        jsonBody: { 
                            error: 'Error de conexión a la base de datos', 
                            details: dbError.message 
                        }
                    };
                }

                // Parsear body
                let body;
                try {
                    body = await request.json();
                    context.log('📄 Request body parsed');
                } catch (parseError) {
                    context.log('❌ JSON parse error:', parseError);
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

                // Consulta a la BD
                try {
                    const query = `
                        SELECT id_usuario, correo_institucional, contrasena_cifrada, tipo_usuario
                        FROM usuario
                        WHERE correo_institucional = $1
                    `;
                    
                    context.log('🔍 Querying database for user:', email);
                    const result = await executeQuery(query, [email]);

                    if (result.rows.length === 0) {
                        context.log('❌ User not found:', email);
                        return {
                            status: 401,
                            headers: corsHeaders,
                            jsonBody: { error: 'Usuario no encontrado' }
                        };
                    }

                    const user = result.rows[0];
                    context.log('✅ User found, verifying password');

                    // Validar contraseña
                    const match = await bcrypt.compare(password, user.contrasena_cifrada);
                    if (!match) {
                        context.log('❌ Password mismatch for user:', email);
                        return {
                            status: 401,
                            headers: corsHeaders,
                            jsonBody: { error: 'Contraseña incorrecta' }
                        };
                    }

                    context.log('✅ Password verified, generating JWT');

                    // Generar JWT
                    const token = jwt.sign(
                        {
                            id: user.id_usuario,
                            email: user.correo_institucional,
                            tipo: user.tipo_usuario
                        },
                        process.env.JWT_SECRET || 'mi_clave_secreta',
                        { expiresIn: '2h' }
                    );

                    context.log('✅ Login successful for user:', email);

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

                } catch (dbError) {
                    context.log('❌ Database query error:', dbError);
                    return {
                        status: 500,
                        headers: corsHeaders,
                        jsonBody: { 
                            error: 'Error en la consulta a la base de datos', 
                            details: dbError.message 
                        }
                    };
                }
            }

            return {
                status: 405,
                headers: corsHeaders,
                jsonBody: { error: 'Método no permitido' }
            };

        } catch (err) {
            context.log('❌ General error in login:', err);
            return {
                status: 500,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                },
                jsonBody: { 
                    error: 'Error general en el servidor', 
                    details: err.message
                }
            };
        }
    }
});