import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import '../src/App.css';
import { ReactTyped } from 'react-typed';
import { Loader } from './common/Loader';
import reactSvg from './assets/react.svg';
import groq from './assets/groq.png';
import socketIo from './assets/socket-io.svg';

const App = () => {
	const [data, setData] = useState(null);
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(true); // Show loading state

	useEffect(() => {
		const socket = io('http://localhost:3000');

		const fetchData = async () => {
			try {
				const response = await fetch('http://localhost:3000/', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
				});

				if (!response.ok) {
					throw new Error(`HTTP error! Status: ${response.status}`);
				}

				const result = await response.json();

				if (result.success) {
					setData(result.data);
				} else {
					setError(result.message);
				}
			} catch (err) {
				console.error('Error fetching data:', err);
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};

		socket.emit('fetchData', { query: "*[_type == 'post']" });

		socket.on('data', (receivedData) => {
			setData(receivedData);
		});

		socket.on('error', (err) => {
			console.error('Socket error:', err);
		});

		fetchData();

		return () => {
			socket.disconnect();
		};
	}, []);
	return (
		<div id='root'>
			<h1>
				<img
					src={reactSvg}
					alt=''
				/>{' '}
				+{' '}
				<img
					style={{ width: '40px', height: '40px' }}
					src={socketIo}
					alt=''
				/>{' '}
				+{' '}
				<img
					style={{ width: '100px', height: '35px' }}
					src={groq}
					alt=''
				/>
			</h1>
			{loading ? (
				<Loader />
			) : error ? (
				<p style={{ color: 'red' }}>Error: {error}</p>
			) : data ? (
				<div>
					<h2>Real time chat:</h2>
					<ReactTyped
						strings={[data]}
						typeSpeed={40}
					/>
				</div>
			) : (
				<p>No data received</p>
			)}
		</div>
	);
};

export default App;
