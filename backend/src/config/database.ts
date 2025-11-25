import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

if (!process.env.DB_NAME && !process.env.NODE_ENV) {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const envFile = nodeEnv === 'production' ? '.env.production' : '.env.development';
  dotenv.config({ path: envFile });
}

const isTestEnv = process.env.NODE_ENV === 'test';

const getDbName = () => process.env.DB_NAME || 'project_management';
const getDbUser = () => process.env.DB_USER || 'root';
const getDbPassword = () => process.env.DB_PASSWORD || 'password';
const getDbHost = () => process.env.DB_HOST || 'localhost';
const getDbPort = () => parseInt(process.env.DB_PORT || '3306');

const getRootUser = () => process.env.DB_ROOT_USER || 'root';
const getRootPassword = () => process.env.DB_ROOT_PASSWORD || process.env.DB_PASSWORD || 'password';

let sequelizeAdminInstance: Sequelize | null = null;

const getSequelizeAdmin = (): Sequelize => {
  if (isTestEnv) {
    throw new Error('Admin connection no disponible en entorno de pruebas');
  }

  if (!sequelizeAdminInstance) {
    sequelizeAdminInstance = new Sequelize('', getRootUser(), getRootPassword(), {
      host: getDbHost(),
      port: getDbPort(),
      dialect: 'mysql',
      logging: false,
      dialectOptions: {
        connectTimeout: 60000,
        allowPublicKeyRetrieval: true,
      },
    });
  }
  return sequelizeAdminInstance;
};

export const sequelize = isTestEnv
  ? new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
    })
  : new Sequelize(getDbName(), getDbUser(), getDbPassword(), {
      host: getDbHost(),
      port: getDbPort(),
      dialect: 'mysql',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      dialectOptions: {
        connectTimeout: 60000,
        allowPublicKeyRetrieval: true,
      },
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    });

export const connectDatabase = async (): Promise<void> => {
  if (isTestEnv) {
    await sequelize.authenticate();
    console.log('✅ SQLite (test) inicializado');
    return;
  }

  const maxRetries = 10;
  const retryDelay = 3000; // 3 segundos
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Intento ${attempt}/${maxRetries} de conexión a MySQL...`);
      
      const currentDbName = getDbName();
      try {
        await sequelize.authenticate();
        console.log(`✅ MySQL conectado exitosamente a la base de datos '${currentDbName}'`);
        return; 
      } catch (directError: unknown) {
        const error = directError as Error;
        if (error.message && error.message.includes("Unknown database")) {
          console.log(`🔍 Base de datos '${currentDbName}' no existe, intentando crearla...`);
          
          try {
            const adminConnection = getSequelizeAdmin();
            await adminConnection.authenticate();
            await adminConnection.query(`CREATE DATABASE IF NOT EXISTS \`${currentDbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`) as [unknown, unknown];
            console.log(`✅ Base de datos '${currentDbName}' creada exitosamente`);
            await adminConnection.close();
            
            await sequelize.authenticate();
            console.log(`✅ MySQL conectado exitosamente a la base de datos '${currentDbName}'`);
            return;
          } catch (createError) {
            console.warn('⚠️ No se pudo crear la base de datos como root, intentando continuar...');
            console.warn('   En Docker Compose, MySQL debería crear la BD automáticamente.');
            throw createError;
          }
        } else if (error.message && (error.message.includes("ECONNREFUSED") || error.message.includes("connect ETIMEDOUT") || error.message.includes("getaddrinfo"))) {
          if (attempt < maxRetries) {
            console.log(`⏳ MySQL aún no está disponible, esperando ${retryDelay/1000} segundos antes de reintentar...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            continue;
          } else {
            throw error;
          }
        } else {
          throw error;
        }
      }
    } catch (error) {
      if (attempt === maxRetries) {
        console.error('❌ Error al conectar con MySQL después de múltiples intentos:', error);
        if (error instanceof Error) {
          console.error('Detalles del error:', error.message);
          console.error('Stack:', error.stack);
        }
        process.exit(1);
      }
    }
  }
};

export const syncDatabase = async (): Promise<void> => {
  try {
    const modelNames = Object.keys(sequelize.models);
    console.log(`📋 Modelos registrados: ${modelNames.join(', ') || 'NINGUNO'}`);
    
    if (modelNames.length === 0) {
      throw new Error('No hay modelos registrados. Asegúrate de importar los modelos antes de sincronizar.');
    }
    
    const syncOptions = { 
      force: false,  // Nunca eliminar datos existentes
      alter: false   // No modificar esquemas existentes, solo crear si no existen
    };
    
    console.log('🔄 Sincronizando modelos con la base de datos...');
    console.log(`   Opciones: force=${syncOptions.force}, alter=${syncOptions.alter}`);
    console.log(`   Modelos a sincronizar: ${modelNames.length}`);
    
    await sequelize.sync(syncOptions);
    
    console.log('✅ Modelos sincronizados - Tablas creadas/verificadas');
    
    let tables: string[] = [];
    if (isTestEnv) {
      const [results] = await sequelize.query(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'",
      ) as [Array<Record<string, unknown>>, unknown];
      const rows = Array.isArray(results) ? results : [];
      tables = rows
        .map((row) => (typeof row.name === 'string' ? row.name : ''))
        .filter((value) => Boolean(value));
    } else {
      const [results] = await sequelize.query("SHOW TABLES") as [Array<Record<string, unknown>>, unknown];
      const rows = Array.isArray(results) ? results : [];
      tables = rows
        .map((row) => {
          const value = Object.values(row)[0];
          return typeof value === 'string' ? value : '';
        })
        .filter((value) => Boolean(value));
    }
    
    if (tables.length > 0) {
      console.log(`📊 Tablas en la base de datos (${tables.length}): ${tables.join(', ')}`);
    } else {
      console.warn('⚠️ ADVERTENCIA: No se encontraron tablas en la base de datos después de la sincronización');
      console.warn('   Esto puede indicar un problema con la sincronización de modelos.');
    }
    
    await seedDefaultProfiles();
    await seedDefaultAdminUser();
    
  } catch (error) {
    console.error('❌ Error al sincronizar modelos:', error);
    if (error instanceof Error) {
      console.error('Detalles del error:', error.message);
      console.error('Stack:', error.stack);
    }
    throw error;
  }
};

export const seedDefaultProfiles = async (): Promise<void> => {
  try {
    const { Profile } = await import('../models');
    
    const existingProfiles = await Profile.findAll();
    if (existingProfiles.length > 0) {
      console.log('✅ Perfiles ya existen en la base de datos');
      return;
    }
    
    await Profile.bulkCreate([
      {
        name: 'administrador',
        description: 'Usuario con permisos de administrador',
      },
      {
        name: 'gestor',
        description: 'Usuario con permisos de gestor',
      },
    ]);
    
    console.log('✅ Perfiles por defecto creados: administrador, gestor');
  } catch (error) {
    console.warn('⚠️ No se pudieron crear los perfiles por defecto:', error);
  }
};

export const seedDefaultAdminUser = async (): Promise<void> => {
  try {
    const { User, Profile } = await import('../models');
    
    const existingAdmin = await User.findOne({
      where: { email: 'administrador@outlook.com' },
    });
    
    if (existingAdmin) {
      console.log('✅ Usuario administrador ya existe en la base de datos');
      return;
    }
    
    const adminProfile = await Profile.findOne({
      where: { name: 'administrador' },
    });
    
    if (!adminProfile) {
      console.warn('⚠️ No se encontró el perfil administrador. Asegúrate de que los perfiles se hayan creado primero.');
      return;
    }
    
    await User.create({
      name: 'administrador',
      email: 'administrador@outlook.com',
      password: '123456',
      profileId: adminProfile.id,
    });
    
    console.log('✅ Usuario administrador por defecto creado');
    console.log('   Email: administrador@outlook.com');
    console.log('   Contraseña: 123456');
    console.log('   ⚠️ IMPORTANTE: Cambia la contraseña después del primer inicio de sesión');
  } catch (error) {
    console.warn('⚠️ No se pudo crear el usuario administrador por defecto:', error);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await sequelize.close();
    console.log('✅ MySQL desconectado');
  } catch (error) {
    console.error('❌ Error al desconectar MySQL:', error);
  }
};
