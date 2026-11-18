// Production Static Server & Cloud REST API for Render Web Service (Zero dependencies)
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.join(__dirname, 'dist');
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const PORT = process.env.PORT || 3000;

// Ensure database directory and file exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(
    DB_FILE,
    JSON.stringify({ users: [], adminPassword: 'admin123' }, null, 2),
    'utf-8'
  );
}

// Helpers for reading and writing database
const readDb = () => {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading db.json:', err);
    return { users: [], adminPassword: 'admin123' };
  }
};

const writeDb = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing db.json:', err);
    return false;
  }
};

// Helper to parse JSON body
const parseJsonBody = (req) => {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
  });
};

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.webp': 'image/webp',
};

const server = http.createServer(async (req, res) => {
  // Add CORS headers for cross-device requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const urlPath = req.url ? req.url.split('?')[0] : '/';

  // -------------------------------------------------------------
  // REST API ENDPOINTS FOR MULTI-DEVICE CLOUD SYNC
  // -------------------------------------------------------------

  // 1. GET /api/data - Get all users and admin info
  if (req.method === 'GET' && urlPath === '/api/data') {
    const db = readDb();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(db));
    return;
  }

  // 2. POST /api/users - Bulk sync or save all users
  if (req.method === 'POST' && urlPath === '/api/users') {
    const body = await parseJsonBody(req);
    const db = readDb();
    if (Array.isArray(body.users)) {
      db.users = body.users;
      writeDb(db);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, count: db.users.length }));
    } else {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'users must be an array' }));
    }
    return;
  }

  // 3. POST /api/user - Save / update single user
  if (req.method === 'POST' && urlPath === '/api/user') {
    const body = await parseJsonBody(req);
    const incomingUser = body.user;
    if (incomingUser && incomingUser.id) {
      const db = readDb();
      const existingIdx = db.users.findIndex((u) => u.id === incomingUser.id);
      if (existingIdx >= 0) {
        db.users[existingIdx] = { ...db.users[existingIdx], ...incomingUser };
      } else {
        db.users.push(incomingUser);
      }
      writeDb(db);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, user: incomingUser }));
    } else {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'user with id required' }));
    }
    return;
  }

  // 4. POST /api/user/delete - Delete user across all devices
  if (req.method === 'POST' && urlPath === '/api/user/delete') {
    const body = await parseJsonBody(req);
    const userId = body.id;
    if (userId) {
      const db = readDb();
      db.users = db.users.filter((u) => u.id !== userId);
      writeDb(db);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, deletedId: userId }));
    } else {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'id required' }));
    }
    return;
  }

  // 5. POST /api/admin/pw - Change admin password
  if (req.method === 'POST' && urlPath === '/api/admin/pw') {
    const body = await parseJsonBody(req);
    if (body.password) {
      const db = readDb();
      db.adminPassword = body.password;
      writeDb(db);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true }));
    } else {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'password required' }));
    }
    return;
  }

  // -------------------------------------------------------------
  // STATIC FILE SERVING (SPA)
  // -------------------------------------------------------------
  let safePath = urlPath;
  if (safePath === '/') safePath = '/index.html';

  let filePath = path.join(DIST_DIR, safePath);

  // Security: Prevent directory traversal
  if (!filePath.startsWith(DIST_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  // Check if file exists, else fallback to index.html (SPA routing)
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      filePath = path.join(DIST_DIR, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Server Error');
        return;
      }

      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
      });
      res.end(content);
    });
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}/ serving ${DIST_DIR} with database at ${DB_FILE}`);
});
