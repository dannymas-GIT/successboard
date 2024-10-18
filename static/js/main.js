document.addEventListener('DOMContentLoaded', function() {
    console.log('Futuristic Dashboard loaded!');
    getIndexData();
});

function getIndexData() {
    fetch('/get_index_data')
        .then(response => response.json())
        .then(data => {
            console.log('Received index data:', data);
            const indexContainer = document.getElementById('indexCharts');
            indexContainer.innerHTML = '';

            for (const [symbol, indexData] of Object.entries(data)) {
                const indexElement = document.createElement('div');
                indexElement.className = 'index-item';
                if (indexData.error) {
                    indexElement.innerHTML = `
                        <h3>${indexData.name}</h3>
                        <p>Error: ${indexData.error}</p>
                    `;
                } else {
                    indexElement.innerHTML = `
                        <h3>${indexData.name}</h3>
                        <p>Price: $${indexData.price}</p>
                        <p>Change: ${indexData.change} (${indexData.change_percent})</p>
                    `;
                }
                indexContainer.appendChild(indexElement);
            }
        })
        .catch(error => {
            console.error('Error fetching index data:', error);
            const indexContainer = document.getElementById('indexCharts');
            indexContainer.innerHTML = '<p>Error: Failed to fetch index data</p>';
        });
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function getStockData() {
    const symbol = document.getElementById('stockSymbol').value;
    const formData = new FormData();
    formData.append('symbol', symbol);

    fetch('/get_stock_data', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log('Received stock data:', data);
        const stockInfo = document.getElementById('stockInfo');
        const chartContainer = document.getElementById('stockChart');
        
        if (data.error) {
            stockInfo.innerHTML = `<p class="error">${data.error}</p>`;
            chartContainer.innerHTML = ''; // Clear the chart area
        } else {
            stockInfo.innerHTML = `
                <h3>${data.symbol}</h3>
                <p>Price: $${data.price}</p>
                <p>Change: ${data.change} (${data.change_percent})</p>
            `;
            
            // Create a simple bar chart
            chartContainer.innerHTML = '<canvas id="stockChartCanvas"></canvas>';
            const ctx = document.getElementById('stockChartCanvas').getContext('2d');
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Price', 'Change'],
                    datasets: [{
                        label: data.symbol,
                        data: [parseFloat(data.price), parseFloat(data.change)],
                        backgroundColor: [
                            'rgba(75, 192, 192, 0.6)',
                            parseFloat(data.change) >= 0 ? 'rgba(75, 192, 192, 0.6)' : 'rgba(255, 99, 132, 0.6)'
                        ],
                        borderColor: [
                            'rgba(75, 192, 192, 1)',
                            parseFloat(data.change) >= 0 ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 99, 132, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: false
                        }
                    }
                }
            });
        }
    })
    .catch(error => {
        console.error('Error fetching stock data:', error);
        const stockInfo = document.getElementById('stockInfo');
        stockInfo.innerHTML = '<p class="error">Error: Failed to fetch stock data</p>';
        const chartContainer = document.getElementById('stockChart');
        chartContainer.innerHTML = ''; // Clear the chart area
    });
}
