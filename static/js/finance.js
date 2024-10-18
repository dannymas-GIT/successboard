document.addEventListener('DOMContentLoaded', function() {
    console.log('Finance Dashboard loaded!');
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

let currentSymbol = '';
let stockChart = null;

function getStockData() {
    const symbol = document.getElementById('stockSymbol').value;
    currentSymbol = symbol;
    fetchStockData(symbol, '1mo');  // Default to 1 month of data
}

function fetchStockData(symbol, period) {
    const formData = new FormData();
    formData.append('symbol', symbol);
    formData.append('period', period);

    fetch('/get_stock_data', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Received stock data:', data);
        const stockInfo = document.getElementById('stockInfo');
        
        if (data.error) {
            stockInfo.innerHTML = `<p class="error">${data.error}</p>`;
            document.getElementById('stockChart').innerHTML = ''; // Clear the chart area
        } else {
            stockInfo.innerHTML = `
                <h3>${data.symbol}</h3>
                <p>Latest Price: $${data.price}</p>
                <p>Change: ${data.change} (${data.change_percent}%)</p>
            `;
            
            updateStockChart(data);
        }
    })
    .catch(error => {
        console.error('Error fetching stock data:', error);
        const stockInfo = document.getElementById('stockInfo');
        stockInfo.innerHTML = `<p class="error">Error: Failed to fetch stock data. ${error.message}</p>`;
        document.getElementById('stockChart').innerHTML = ''; // Clear the chart area
    });
}

function updateStockChart(data) {
    const chartContainer = document.getElementById('stockChart');
    chartContainer.innerHTML = '<canvas id="stockChartCanvas"></canvas>';
    const ctx = document.getElementById('stockChartCanvas').getContext('2d');
    
    if (stockChart) {
        stockChart.destroy();
    }
    
    stockChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.dates,
            datasets: [{
                label: data.symbol,
                data: data.prices.map((price, index) => ({x: data.dates[index], y: price})),
                borderColor: 'rgba(75, 192, 192, 1)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day'
                    },
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Price'
                    }
                }
            },
            plugins: {
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            }
        }
    });
}

function updateChartTimeRange(period) {
    if (currentSymbol) {
        fetchStockData(currentSymbol, period);
    }
}
