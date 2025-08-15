// src/functions/shared/database.js
const { Pool } = require('pg');
require('dotenv').config();

// Configuración de conexión para PostgreSQL en Render
const config = {
    connectionString: process.env.DATABASE_URL, // Render proporciona esta variable
    // Configuración alternativa manual si no usas DATABASE_URL
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'universidad_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    
    // Configuraciones específicas para Render y producción
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,

    
    // Pool de conexiones
    max: 10, // Máximo número de conexiones
    min: 0,  // Mínimo número de conexiones
    acquire: 30000, // Tiempo máximo para obtener conexión (ms)
    idle: 10000,    // Tiempo máximo de conexión inactiva (ms)
};

// Pool de conexiones
let pool;

// Inicializar pool de conexiones
function getPool() {
    if (!pool) {
        pool = new Pool(config);
        
        pool.on('connect', () => {
            console.log('✅ Nueva conexión establecida a PostgreSQL');
        });
        
        pool.on('error', (err) => {
            console.error('❌ Error inesperado en pool de PostgreSQL:', err);
            pool = null;
        });
        
        console.log('🐘 Pool de PostgreSQL inicializado');
    }
    return pool;
}

// Ejecutar consulta con manejo de errores
async function executeQuery(text, params = []) {
    const client = getPool();
    const start = Date.now();
    
    try {
        // Log de la consulta en desarrollo
        if (process.env.NODE_ENV === 'development') {
            console.log('🔍 Ejecutando consulta:', text.substring(0, 100) + '...');
        }
        
        const result = await client.query(text, params);
        const duration = Date.now() - start;
        
        console.log(`⚡ Consulta ejecutada en ${duration}ms - ${result.rowCount} filas afectadas`);
        
        return result;
    } catch (error) {
        const duration = Date.now() - start;
        console.error(`❌ Error en consulta después de ${duration}ms:`, error.message);
        console.error('📝 Query:', text.substring(0, 200));
        console.error('📋 Params:', params);
        
        // Re-lanzar el error para que lo maneje el caller
        throw error;
    }
}

// Ejecutar transacción
async function executeTransaction(queries) {
    const client = await getPool().connect();
    
    try {
        await client.query('BEGIN');
        console.log('🔄 Transacción iniciada');
        
        const results = [];
        for (const query of queries) {
            const result = await client.query(query.text, query.params);
            results.push(result);
        }
        
        await client.query('COMMIT');
        console.log('✅ Transacción completada exitosamente');
        
        return results;
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('🔙 Transacción revertida debido a error:', error.message);
        throw error;
    } finally {
        client.release();
    }
}

// Verificar conexión a la base de datos
async function testConnection() {
    try {
        const result = await executeQuery('SELECT NOW() as current_time, version() as pg_version');
        console.log('✅ Conexión a PostgreSQL exitosa');
        console.log('🕐 Tiempo del servidor:', result.rows[0].current_time);
        console.log('🐘 Versión PostgreSQL:', result.rows[0].pg_version.split(' ')[0]);
        return true;
    } catch (error) {
        console.error('❌ Error de conexión a PostgreSQL:', error.message);
        return false;
    }
}

// Cerrar pool de conexiones (para limpieza)
async function closePool() {
    if (pool) {
        await pool.end();
        pool = null;
        console.log('🔐 Pool de PostgreSQL cerrado');
    }
}

// Helper para construcción de queries
const QueryBuilder = {
    // Construir query SELECT con filtros dinámicos
    buildSelectQuery(table, fields = '*', filters = {}, options = {}) {
        let query = `SELECT ${fields} FROM ${table}`;
        const params = [];
        let paramCount = 0;
        
        // WHERE clause
        if (Object.keys(filters).length > 0) {
            const conditions = [];
            for (const [key, value] of Object.entries(filters)) {
                if (value !== undefined && value !== null) {
                    paramCount++;
                    if (key.includes('LIKE')) {
                        conditions.push(`${key.replace('LIKE', '')} ILIKE $${paramCount}`);
                        params.push(`%${value}%`);
                    } else {
                        conditions.push(`${key} = $${paramCount}`);
                        params.push(value);
                    }
                }
            }
            if (conditions.length > 0) {
                query += ` WHERE ${conditions.join(' AND ')}`;
            }
        }
        
        // ORDER BY
        if (options.orderBy) {
            query += ` ORDER BY ${options.orderBy}`;
        }
        
        // LIMIT y OFFSET
        if (options.limit) {
            paramCount++;
            query += ` LIMIT $${paramCount}`;
            params.push(options.limit);
        }
        
        if (options.offset) {
            paramCount++;
            query += ` OFFSET $${paramCount}`;
            params.push(options.offset);
        }
        
        return { query, params };
    },
    
    // Construir query UPDATE dinámico
    buildUpdateQuery(table, data, idField = 'id', idValue) {
        const fields = [];
        const params = [];
        let paramCount = 0;
        
        for (const [key, value] of Object.entries(data)) {
            if (key !== idField && value !== undefined) {
                paramCount++;
                fields.push(`${key} = $${paramCount}`);
                params.push(value);
            }
        }
        
        if (fields.length === 0) {
            throw new Error('No hay campos para actualizar');
        }
        
        paramCount++;
        const query = `UPDATE ${table} SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE ${idField} = $${paramCount} RETURNING *`;
        params.push(idValue);
        
        return { query, params };
    }
};

module.exports = {
    getPool,
    executeQuery,
    executeTransaction,
    testConnection,
    closePool,
    QueryBuilder
};