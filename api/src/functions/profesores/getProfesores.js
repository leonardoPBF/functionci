// src/functions/profesores/getProfesores.js
const { app } = require('@azure/functions');
const { executeQuery, testConnection } = require('../shared/database');

// Helper para respuestas HTTP
function createResponse(statusCode, body) {
    return {
        status: statusCode,
        body: JSON.stringify(body, null, 2),
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
    };
}

// Función para obtener profesores (GET)
app.http('getProfesores', {
    methods: ['GET', 'OPTIONS'],
    route: 'profesores/{id:int?}', // Especifica que id es opcional y debe ser int
    authLevel: 'anonymous',
    handler: async (request, context) => {
        try {
            // Manejar preflight CORS
            if (request.method === 'OPTIONS') {
                return createResponse(200, { message: 'CORS preflight OK' });
            }

            // Obtener ID del parámetro de ruta O del query parameter (para compatibilidad)
            const routeId = request.params.id;
            const queryId = request.query.get('id');
            const id = routeId || queryId;

            context.log(`📝 GET /api/profesores${id ? `/${id}` : ''}`);
            context.log(`🔍 Route ID: ${routeId}, Query ID: ${queryId}`);

            // Test de conexión
            if (!(await testConnection())) {
                return createResponse(503, { 
                    error: 'Servicio no disponible',
                    message: 'No se puede conectar a la base de datos'
                });
            }

            if (id) {
                // Obtener profesor por ID
                return await getProfesorById(id, context);
            } else {
                // Obtener lista de profesores
                return await getAllProfesores(request, context);
            }

        } catch (error) {
            context.log.error('❌ Error en getProfesores:', error);
            return createResponse(500, { 
                error: 'Error interno del servidor',
                message: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
            });
        }
    }
});

// Obtener profesor por ID
async function getProfesorById(id, context) {
    try {
        // Validar que el ID sea un número
        const numericId = parseInt(id);
        if (!id || isNaN(numericId) || numericId <= 0) {
            return createResponse(400, { 
                error: 'ID inválido',
                message: 'El ID debe ser un número positivo válido',
                received: id
            });
        }

        const query = `
            SELECT 
                id, 
                nombre, 
                apellido, 
                email, 
                telefono, 
                departamento, 
                especialidad, 
                grado_academico, 
                fecha_contratacion, 
                salario, 
                estado, 
                fecha_nacimiento, 
                direccion,
                created_at, 
                updated_at
            FROM profesores 
            WHERE id = $1 AND estado != 'Eliminado'
        `;
        
        const result = await executeQuery(query, [numericId]);
        
        if (result.rows.length === 0) {
            return createResponse(404, { 
                error: 'Profesor no encontrado',
                message: `No se encontró un profesor con ID ${numericId}`,
                id: numericId
            });
        }
        
        const profesor = result.rows[0];
        
        context.log(`✅ Profesor ${numericId} encontrado: ${profesor.nombre} ${profesor.apellido}`);
        
        return createResponse(200, { 
            data: profesor,
            success: true,
            message: 'Profesor encontrado exitosamente'
        });

    } catch (error) {
        context.log.error(`❌ Error obteniendo profesor ${id}:`, error);
        return createResponse(500, { 
            error: 'Error obteniendo profesor',
            message: 'No se pudo obtener la información del profesor'
        });
    }
}

// Obtener todos los profesores con filtros y paginación
async function getAllProfesores(request, context) {
    try {
        // Parámetros de paginación
        const page = Math.max(parseInt(request.query.get('page')) || 1, 1);
        const limit = Math.min(Math.max(parseInt(request.query.get('limit')) || 10, 1), 50);
        const offset = (page - 1) * limit;
        
        // Parámetros de filtro
        const departamento = request.query.get('departamento');
        const estado = request.query.get('estado') || 'Activo';
        const search = request.query.get('search');

        // Construir query base
        let whereConditions = ["estado != 'Eliminado'"];
        let queryParams = [];
        let paramCount = 0;

        // Filtro por departamento
        if (departamento && departamento !== 'todos') {
            paramCount++;
            whereConditions.push(`departamento = $${paramCount}`);
            queryParams.push(departamento);
        }

        // Filtro por estado
        if (estado && estado !== 'todos') {
            paramCount++;
            whereConditions.push(`estado = $${paramCount}`);
            queryParams.push(estado);
        }

        // Filtro por búsqueda de texto
        if (search && search.trim()) {
            paramCount++;
            whereConditions.push(`(nombre ILIKE $${paramCount} OR apellido ILIKE $${paramCount} OR email ILIKE $${paramCount})`);
            queryParams.push(`%${search.trim()}%`);
        }

        const whereClause = whereConditions.join(' AND ');

        // Query principal para obtener profesores
        const dataQuery = `
            SELECT 
                id, 
                nombre, 
                apellido, 
                email, 
                telefono, 
                departamento, 
                especialidad, 
                grado_academico, 
                estado,
                created_at
            FROM profesores 
            WHERE ${whereClause}
            ORDER BY created_at DESC
            LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
        `;

        // Query para contar total de registros
        const countQuery = `
            SELECT COUNT(*) as total 
            FROM profesores 
            WHERE ${whereClause}
        `;

        // Agregar parámetros de paginación
        const dataParams = [...queryParams, limit, offset];
        const countParams = [...queryParams];

        // Ejecutar ambas queries
        const [dataResult, countResult] = await Promise.all([
            executeQuery(dataQuery, dataParams),
            executeQuery(countQuery, countParams)
        ]);

        const total = parseInt(countResult.rows[0].total);
        const totalPages = Math.ceil(total / limit);

        // Estadísticas adicionales
        const statsQuery = `
            SELECT 
                COUNT(*) FILTER (WHERE estado = 'Activo') as activos,
                COUNT(*) FILTER (WHERE estado = 'Inactivo') as inactivos,
                COUNT(DISTINCT departamento) as departamentos
            FROM profesores 
            WHERE estado != 'Eliminado'
        `;
        
        const statsResult = await executeQuery(statsQuery);
        const stats = statsResult.rows[0];

        context.log(`✅ Obtenidos ${dataResult.rows.length} profesores de ${total} total`);

        return createResponse(200, {
            data: dataResult.rows,
            pagination: {
                page,
                limit,
                total,
                pages: totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
                showing: dataResult.rows.length
            },
            filters: {
                departamento: departamento || 'todos',
                estado: estado || 'todos',
                search: search || null
            },
            stats: {
                activos: parseInt(stats.activos),
                inactivos: parseInt(stats.inactivos),
                departamentos: parseInt(stats.departamentos)
            },
            success: true,
            message: `${dataResult.rows.length} profesores encontrados`
        });

    } catch (error) {
        context.log.error('❌ Error obteniendo lista de profesores:', error);
        return createResponse(500, { 
            error: 'Error obteniendo profesores',
            message: 'No se pudo obtener la lista de profesores'
        });
    }
}