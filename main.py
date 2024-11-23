from flask import Flask, render_template

# Initialize Flask app
app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')  # Render HTML template when accessing the root URL

if __name__ == '__main__':
    # Run the app on port 80
    app.run(host='0.0.0.0', port=80)
