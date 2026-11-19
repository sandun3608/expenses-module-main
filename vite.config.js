import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

const currentDir = import.meta.dirname || process.cwd();
const DATA_DIR = path.join(currentDir, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const getDb = () => {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify({ users: [], adminPassword: 'admin123' }, null, 2));
    }
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  } catch {
    return { users: [], adminPassword: 'admin123' };
  }
};

const saveDb = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch {
    return false;
  }
};

const apiPlugin = () => {
  const handler = (req, res, next) => {
    const url = req.url?.split('?')[0];
    if (url === '/api/data' && req.method === 'GET') {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(getDb()));
      return;
    }
    if (url === '/api/users' && req.method === 'POST') {
      let body = '';
      req.on('data', (c) => (body += c));
      req.on('end', () => {
        try {
          const parsed = JSON.parse(body || '{}');
          const db = getDb();
          if (Array.isArray(parsed.users)) {
            db.users = parsed.users;
            saveDb(db);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, count: db.users.length }));
            return;
          }
        } catch (e) {
          console.error('Error parsing /api/users body:', e);
        }
        res.statusCode = 400;
        res.end('users array required');
      });
      return;
    }
    if (url === '/api/user' && req.method === 'POST') {
      let body = '';
      req.on('data', (c) => (body += c));
      req.on('end', () => {
        try {
          const parsed = JSON.parse(body || '{}');
          if (parsed.user && parsed.user.id) {
            const db = getDb();
            const idx = db.users.findIndex((u) => u.id === parsed.user.id);
            if (idx >= 0) db.users[idx] = { ...db.users[idx], ...parsed.user };
            else db.users.push(parsed.user);
            saveDb(db);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, user: parsed.user }));
            return;
          }
        } catch (e) {
          console.error('Error parsing /api/user body:', e);
        }
        res.statusCode = 400;
        res.end('user required');
      });
      return;
    }
    if (url === '/api/user/delete' && req.method === 'POST') {
      let body = '';
      req.on('data', (c) => (body += c));
      req.on('end', () => {
        try {
          const parsed = JSON.parse(body || '{}');
          if (parsed.id) {
            const db = getDb();
            db.users = db.users.filter((u) => u.id !== parsed.id);
            saveDb(db);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, deletedId: parsed.id }));
            return;
          }
        } catch (e) {
          console.error('Error parsing /api/user/delete body:', e);
        }
        res.statusCode = 400;
        res.end('id required');
      });
      return;
    }
    if (url === '/api/admin/pw' && req.method === 'POST') {
      let body = '';
      req.on('data', (c) => (body += c));
      req.on('end', () => {
        try {
          const parsed = JSON.parse(body || '{}');
          if (parsed.password) {
            const db = getDb();
            db.adminPassword = parsed.password;
            saveDb(db);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true }));
            return;
          }
        } catch (e) {
          console.error('Error parsing /api/admin/pw body:', e);
        }
        res.statusCode = 400;
        res.end('password required');
      });
      return;
    }
    next();
  };

  return {
    name: 'api-server-middleware',
    configureServer(server) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler);
    },
  };
};

export default defineConfig({
  plugins: [
    apiPlugin(),
    react(),
    tailwindcss(),
  ],
  server: {
    host: true,
    port: 5173,
  },
  build: {
    chunkSizeWarningLimit: 1200,
  },
});
