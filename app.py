from flask import Flask, render_template, request, jsonify
import yfinance as yf
import logging
from datetime import datetime, timedelta
import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Set up logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

# Get the API key and log if it's not found
NEWS_API_KEY = os.getenv('NEWS_API_KEY')
logging.info(f"NEWS_API_KEY: {'Set' if NEWS_API_KEY else 'Not set'}")
if not NEWS_API_KEY:
    logging.error("NEWS_API_KEY not found in environment variables")

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/finance')
def finance():
    return render_template('finance.html')

@app.route('/news')
def news():
    return render_template('news.html')

@app.route('/sports')
def sports():
    return render_template('sports.html')

@app.route('/research')
def research():
    return render_template('research.html')

@app.route('/get_stock_data', methods=['POST'])
def get_stock_data():
    symbol = request.form['symbol'].upper()
    period = request.form.get('period', '1mo')  # Default to 1 month if not provided
    
    logging.info(f"Fetching stock data for {symbol} with period {period}")
    
    try:
        stock = yf.Ticker(symbol)
        hist = stock.history(period=period)
        
        logging.info(f"Retrieved history for {symbol}: {hist.head()}")
        
        if hist.empty:
            logging.error(f"No data available for {symbol}")
            return jsonify({"error": f"No data available for {symbol}"}), 404

        latest_data = hist.iloc[-1]
        data = {
            'symbol': symbol,
            'price': round(latest_data['Close'], 2),
            'change': round(latest_data['Close'] - latest_data['Open'], 2),
            'change_percent': round((latest_data['Close'] - latest_data['Open']) / latest_data['Open'] * 100, 2),
            'dates': hist.index.strftime('%Y-%m-%d').tolist(),
            'prices': hist['Close'].tolist(),
        }
        logging.info(f"Successfully fetched data for {symbol}: {data}")
        return jsonify(data)

    except Exception as e:
        logging.error(f"Error fetching stock data for {symbol}: {str(e)}")
        return jsonify({"error": f"Failed to fetch stock data for {symbol}: {str(e)}"}), 500

@app.route('/get_index_data')
def get_index_data():
    indexes = {'SPY': 'S&P 500', 'DIA': 'Dow Jones', 'QQQ': 'NASDAQ'}
    index_data = {}

    for symbol, name in indexes.items():
        try:
            logging.info(f"Fetching data for {name} ({symbol})")
            index = yf.Ticker(symbol)
            hist = index.history(period="1d")
            
            if hist.empty:
                logging.error(f"No data available for {symbol}")
                index_data[symbol] = {'name': name, 'error': 'No data available'}
            else:
                index_data[symbol] = {
                    'name': name,
                    'price': round(hist['Close'].iloc[-1], 2),
                    'change': round(hist['Close'].iloc[-1] - hist['Open'].iloc[-1], 2),
                    'change_percent': f"{round((hist['Close'].iloc[-1] - hist['Open'].iloc[-1]) / hist['Open'].iloc[-1] * 100, 2)}%"
                }
                logging.info(f"Successfully processed data for {name}: {index_data[symbol]}")
        except Exception as e:
            logging.error(f"Error fetching data for {symbol}: {e}")
            index_data[symbol] = {'name': name, 'error': str(e)}

    logging.info(f"Final index_data: {index_data}")
    return jsonify(index_data)

@app.route('/get_news_data')
def get_news_data():
    if not NEWS_API_KEY:
        logging.error("Attempted to fetch news without an API key")
        return jsonify({"error": "News API key is not configured"}), 500

    url = f'https://newsapi.org/v2/top-headlines?country=us&category=business&apiKey={NEWS_API_KEY}'
    try:
        response = requests.get(url)
        response.raise_for_status()  # This will raise an exception for HTTP errors
        data = response.json()
        articles = data.get('articles', [])[:5]  # Get top 5 articles
        return jsonify(articles)
    except requests.RequestException as e:
        logging.error(f"Failed to fetch news data: {e}")
        return jsonify({"error": "Failed to fetch news data"}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
