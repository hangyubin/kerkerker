import { MongoClient, Db } from 'mongodb';
import { COLLECTIONS } from './constants/db';

/** MongoDB 连接池配置 */
const MONGO_OPTIONS = {
  maxPoolSize: 10,
  minPoolSize: 2,
  maxIdleTimeMS: 30000,
  connectTimeoutMS: 10000,
  retryWrites: true,
  retryReads: true,
} as const;

/** 健康检查间隔（毫秒） */
const HEALTH_CHECK_INTERVAL = 30000;

/** 默认数据库名称 */
const DEFAULT_DB_NAME = 'kerkerker';

/**
 * 获取 MongoDB 连接 URI
 * @throws 当 MONGODB_URI 环境变量未设置时抛出错误
 */
function getMongoURI(): string {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI 环境变量未设置');
  }
  return uri;
}

/**
 * 获取数据库名称
 */
function getDbName(): string {
  return process.env.MONGODB_DB_NAME || DEFAULT_DB_NAME;
}

/** MongoDB 全局缓存类型定义 */
interface MongoGlobal {
  mongoClient: MongoClient | undefined;
  mongoDb: Db | undefined;
  mongoClientPromise: Promise<MongoClient> | undefined;
  lastHealthCheck: number;
  initialized: boolean;
}

// 使用 globalThis 缓存连接，确保在 Next.js 热重载和无服务器环境中正确复用
const globalForMongo = globalThis as unknown as MongoGlobal;

// 初始化全局状态
function initializeGlobalState(): void {
  if (globalForMongo.lastHealthCheck === undefined) {
    globalForMongo.lastHealthCheck = 0;
  }
  if (globalForMongo.initialized === undefined) {
    globalForMongo.initialized = false;
  }
}

initializeGlobalState();

/**
 * 检查 MongoDB 连接健康状态
 * 带间隔优化，避免频繁检查
 */
async function isConnectionHealthy(): Promise<boolean> {
  const now = Date.now();
  
  // 30秒内跳过重复检查
  if (now - globalForMongo.lastHealthCheck < HEALTH_CHECK_INTERVAL) {
    return !!globalForMongo.mongoClient;
  }

  if (!globalForMongo.mongoClient) {
    return false;
  }
  
  try {
    await globalForMongo.mongoClient.db().admin().ping();
    globalForMongo.lastHealthCheck = now;
    return true;
  } catch {
    return false;
  }
}

/**
 * 清理失效的数据库连接
 */
function clearConnection(): void {
  globalForMongo.mongoClientPromise = undefined;
  globalForMongo.mongoClient = undefined;
  globalForMongo.mongoDb = undefined;
  globalForMongo.lastHealthCheck = 0;
  globalForMongo.initialized = false;
}

/**
 * 获取 MongoClient 实例
 * 用于需要直接操作客户端的场景，如事务
 */
export function getMongoClient(): MongoClient | undefined {
  return globalForMongo.mongoClient;
}

/**
 * 获取数据库实例
 * 自动处理连接池和健康检查
 */
export async function getDatabase(): Promise<Db> {
  // 如果已有数据库实例，验证连接健康状态
  if (globalForMongo.mongoDb) {
    if (await isConnectionHealthy()) {
      return globalForMongo.mongoDb;
    }
    console.log('⚠️ MongoDB 连接失效，正在重新连接...');
    clearConnection();
  }

  try {
    const uri = getMongoURI();
    const dbName = getDbName();
    
    // 如果没有 client promise，创建一个
    if (!globalForMongo.mongoClientPromise) {
      const client = new MongoClient(uri, MONGO_OPTIONS);
      globalForMongo.mongoClientPromise = client.connect();
    }
    
    // 等待连接完成
    globalForMongo.mongoClient = await globalForMongo.mongoClientPromise;
    globalForMongo.mongoDb = globalForMongo.mongoClient.db(dbName);
    
    // 初始化数据库集合和索引（仅首次）
    await initializeDatabase(globalForMongo.mongoDb);
    
    console.log('✅ MongoDB 连接成功');
    return globalForMongo.mongoDb;
  } catch (error) {
    clearConnection();
    console.error('❌ MongoDB 连接失败:', error);
    throw error;
  }
}

/**
 * 数据库索引配置
 */
const INDEX_CONFIGS = [
  {
    collection: COLLECTIONS.VOD_SOURCES,
    indexes: [
      { key: { key: 1 }, options: { unique: true } },
      { key: { enabled: 1 }, options: {} },
      { key: { sort_order: 1 }, options: {} },
    ],
  },
  {
    collection: COLLECTIONS.VOD_SOURCE_SELECTION,
    indexes: [{ key: { id: 1 }, options: { unique: true } }],
  },
  {
    collection: COLLECTIONS.DAILYMOTION_CHANNELS,
    indexes: [
      { key: { id: 1 }, options: { unique: true } },
      { key: { username: 1 }, options: {} },
      { key: { isActive: 1 }, options: {} },
    ],
  },
  {
    collection: COLLECTIONS.DAILYMOTION_CONFIG,
    indexes: [{ key: { id: 1 }, options: { unique: true } }],
  },
] as const;

/**
 * 初始化数据库集合和索引
 * 仅首次执行，跳过重复初始化
 */
async function initializeDatabase(db: Db): Promise<void> {
  if (globalForMongo.initialized) {
    return;
  }

  try {
    for (const config of INDEX_CONFIGS) {
      const collection = db.collection(config.collection);
      
      for (const { key, options } of config.indexes) {
        try {
          await collection.createIndex(key, options);
        } catch (indexError) {
          // 索引已存在时忽略错误
          if ((indexError as Error).message?.includes('already exists')) {
            continue;
          }
          throw indexError;
        }
      }
    }

    globalForMongo.initialized = true;
    console.log('✅ MongoDB 数据库初始化完成');
  } catch (error) {
    console.error('⚠️ 数据库初始化警告:', error);
    // 不抛出错误，因为索引可能已经存在
  }
}

/**
 * 关闭数据库连接
 * 清理资源并重置状态
 */
export async function closeDatabase(): Promise<void> {
  if (!globalForMongo.mongoClient) {
    return;
  }

  try {
    await globalForMongo.mongoClient.close();
    console.log('✅ MongoDB 连接已关闭');
  } catch (error) {
    console.error('❌ 关闭 MongoDB 连接失败:', error);
  } finally {
    clearConnection();
  }
}
