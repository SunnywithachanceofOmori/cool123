import http from 'http';
import fs from 'fs';
import path from 'path';
import GimkitRoom from './index.js';

const server = http.createServer((req, res) => {
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'POST' && req.url === '/spawn') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const { roomId, name, amount } = JSON.parse(body);
                if (!roomId || !amount) {
                    res.writeHead(400);
                    res.end(JSON.stringify({ error: 'Missing roomId or amount' }));
                    return;
                }

                const room = new GimkitRoom(roomId);
                await room.roomInfoReady;

                const results = [];
                const amt = Math.min(parseInt(amount), 60);

                for (let i = 0; i < amt; i++) {
                    try {
                        await room.spawn(name || `Bot ${i}`);
                        results.push({ bot: i, status: 'connected' });
                    } catch (e) {
                        results.push({ bot: i, status: 'failed' });
                    }
                }

                res.writeHead(200);
                res.end(JSON.stringify({ success: true, results }));

            } catch (err) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: err.message }));
            }
        });
    } else {
        // Serve the index.html file
        fs.readFile(path.join(process.cwd(), 'index.html'), (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading page');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});