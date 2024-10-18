document.addEventListener('DOMContentLoaded', function() {
    console.log('News Dashboard loaded!');
    getNewsData();
});

function getNewsData() {
    fetch('/get_news_data')
        .then(response => response.json())
        .then(data => {
            console.log('Received news data:', data);
            const newsContainer = document.getElementById('newsContainer');
            newsContainer.innerHTML = '';

            data.forEach(article => {
                const articleElement = document.createElement('div');
                articleElement.className = 'news-item';
                articleElement.innerHTML = `
                    <h3>${article.title}</h3>
                    <p>${article.description}</p>
                    <a href="${article.url}" target="_blank">Read more</a>
                `;
                newsContainer.appendChild(articleElement);
            });
        })
        .catch(error => {
            console.error('Error fetching news data:', error);
            const newsContainer = document.getElementById('newsContainer');
            newsContainer.innerHTML = '<p>Error: Failed to fetch news data</p>';
        });
}
