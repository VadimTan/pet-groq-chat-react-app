import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import cors from 'cors';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

const server = createServer(app);
const apiKey = process.env.GROQ_API_KEY;

const client = new Groq({
	apiKey: apiKey,
});

app.post('/', async (req, res) => {
	try {
		const chatCompletion = await client.chat.completions.create({
			messages: [
				{ role: 'user', content: 'Explain the importance of low latency LLMs' },
			],
			model: 'llama3-8b-8192',
		});

		res.json({
			success: true,
			data: chatCompletion.choices[0].message.content,
		});
	} catch (error) {
		console.error('Error in POST /:', error);
		res.status(500).json({ success: false, message: 'Internal Server Error' });
	}
});

const io = new Server(server, {
	cors: {
		origin: 'http://localhost:5173',
		methods: ['GET', 'POST'],
	},
});

io.on('connection', (socket) => {
	console.log('New client connected');

	socket.on('fetchData', async () => {
		try {
			const chatCompletion = await client.chat.completions.create({
				messages: [
					{
						role: 'user',
						content: 'Explain the importance of low latency LLMs',
					},
				],
				model: 'llama3-8b-8192',
			});

			socket.emit('data', chatCompletion.choices[0].message.content);
		} catch (error) {
			socket.emit('error', 'Failed to fetch data');
		}
	});
});

app.get('/', (req, res) => {
	res.send('This is the API server.');
});

server.listen(3000, () => {
	console.log('server running at http://localhost:3000');
});
