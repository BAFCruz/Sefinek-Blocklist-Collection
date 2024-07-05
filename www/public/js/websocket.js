const updateStats = (id, value) => {
	const statsContentElement = document.getElementById(`stats-content-${id}`);
	if (!statsContentElement) return console.error(`Element with ID "${id}" not found.`);

	// Check if the value has changed before updating
	const oldValue = statsContentElement.textContent;

	// Format the value, adding commas as thousands separator
	const formattedValue = value?.toLocaleString();
	if (oldValue === formattedValue) return;

	statsContentElement.textContent = formattedValue;
	statsContentElement.classList.add('stats-updated');

	// Remove the animation class after a certain time
	setTimeout(() => {
		statsContentElement.classList.remove('stats-updated');
	}, 1000);
};

document.addEventListener('DOMContentLoaded', () => {
	// Create a new WebSocket connection
	const socket = new WebSocket(WEBSOCKET);

	socket.onopen = () => {
		console.log('WebSocket connection established.');
	};

	socket.onmessage = event => {
		const parsedData = JSON.parse(event.data);

		// Update elements on the page
		updateStats('all-requests', parsedData.stats.requests.all);
		updateStats('blocklist-requests', parsedData.stats.requests.blocklist);

		updateStats('127001', parsedData.stats.requests['127001']);
		updateStats('0000', parsedData.stats.requests['0000']);
		updateStats('adguard', parsedData.stats.requests.adguard);
		updateStats('dnsmasq', parsedData.stats.requests.dnsmasq);
		updateStats('noip', parsedData.stats.requests.noip);
		updateStats('unbound', parsedData.stats.requests.unbound);
		updateStats('rpz', parsedData.stats.requests.rpz);

		updateStats('404', parsedData.stats.responses['404'] || 0);
		updateStats('429', parsedData.stats.responses['429'] || 0);
		updateStats('500', parsedData.stats.responses['500'] || 0);
		updateStats('503', parsedData.stats.responses['503'] || 0);

		updateStats('uptime', parsedData.uptime);
		updateStats('coll-cAt', formatDate(parsedData.coll.createdAt));
		updateStats('coll-uAt', formatDate(parsedData.coll.updatedAt));
	};

	socket.onclose = event => {
		if (event.wasClean) {
			console.log('WebSocket connection was closed gracefully.');
		} else {
			console.error('WebSocket connection was unexpectedly closed.');
		}

		console.debug(`Closing code: ${event.code}`);
	};

	socket.onerror = err => {
		console.error(`WebSocket connection error: ${err.message}`);
	};
});