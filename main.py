from flask import Flask, render_template, request, redirect, url_for, session, jsonify
import os
import hashlib
import json

app = Flask(__name__)
app.secret_key = 'your_secret_key'

# Ensure users and data directories exist
os.makedirs('users', exist_ok=True)
os.makedirs('data', exist_ok=True)

USERS_FILE = 'users/users.json'


# Utility Functions
def hash_password(password):
    """Hash a password using SHA256."""
    return hashlib.sha256(password.encode()).hexdigest()


def load_users():
    """Load all users from users.json."""
    if not os.path.exists(USERS_FILE):
        with open(USERS_FILE, 'w') as f:
            json.dump({}, f)
    with open(USERS_FILE, 'r') as f:
        return json.load(f)


def save_users(users):
    """Save all users to users.json."""
    with open(USERS_FILE, 'w') as f:
        json.dump(users, f, indent=4)


def load_user_data(username):
    """Load user game data from the data folder."""
    filepath = os.path.join('data', f'{username}.json')
    if os.path.exists(filepath):
        with open(filepath, 'r') as f:
            return json.load(f)
    return {'points': 0, 'pointsPerClick': 1, 'autoClickerRate': 0, 'prestigeLevel': 0, 'preferences': {'darkMode': False}}


def save_user_data(username, data):
    """Save user game data to the data folder."""
    filepath = os.path.join('data', f'{username}.json')
    with open(filepath, 'w') as f:
        json.dump(data, f, indent=4)


# Routes
@app.route('/')
def index():
    if 'username' in session:
        username = session['username']
        user_data = load_user_data(username)
        return render_template('index.html', username=username, user_data=user_data)
    return redirect(url_for('login'))


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        # Get the username and password from the form data
        username = request.form['username']
        password = request.form['password']
        users = load_users()

        # Check if the user exists and the password matches
        if username in users and users[username]['password'] == hash_password(password):
            session['username'] = username
            return redirect(url_for('index'))  # Redirect to the game/index page
        return "Invalid username or password", 401  # Return a simple error message

    return render_template('login.html')


@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        # Get the username and password from the form data
        username = request.form['username']
        password = request.form['password']
        users = load_users()

        # Check if the username already exists
        if username in users:
            return "Username already exists", 400
        
        # Add the new user to users.json
        users[username] = {'password': hash_password(password)}
        save_users(users)

        # Initialize user game data
        save_user_data(username, {'preferences': {'darkMode': False}})
        
        # Redirect the user to the login page after successful signup
        return redirect(url_for('login'))
    return render_template('signup.html')


@app.route('/logout')
def logout():
    session.pop('username', None)
    return redirect(url_for('login'))


@app.route('/save', methods=['POST'])
def save_game():
    username = session.get('username')
    if not username:
        return jsonify({"error": "User not logged in"}), 401

    try:
        data = request.json
        game_data = {
            'points': data['points'],
            'pointsPerClick': data['pointsPerClick'],
            'upgradeCost': data['upgradeCost'],
            'autoClickerRate': data['autoClickerRate'],
            'prestigeLevel': data['prestigeLevel'],
            'boostActive': data['boostActive']
        }
        
        preferences = data.get('preferences', {})  # Dark mode preference can be included here
        user_data = load_user_data(username)  # Load user data
        if user_data:
            user_data['game_data'] = game_data  # Update the game data
            user_data['preferences'] = preferences  # Update preferences
            save_user_data(username, user_data)  # Save the updated data
            return jsonify({"success": True}), 200
        return jsonify({"error": "User data not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/load', methods=['GET'])
def load_game():
    username = session.get('username')
    if not username:
        return jsonify({"error": "User not logged in"}), 401

    user_data = load_user_data(username)  # Load user data from the database or file
    if user_data:
        # Extract game data and preferences from user data
        game_data = user_data.get('game_data', {})
        preferences = user_data.get('preferences', {})

        # Merge preferences with game data and return them in the response
        response_data = {
            'data': game_data,
            'preferences': preferences  # Ensure preferences are included in the response
        }
        return jsonify(response_data)
    return jsonify({"error": "No game data found"}), 404



@app.route('/update-preferences', methods=['POST'])
def update_preferences():
    username = session.get('username')
    if not username:
        return jsonify({"error": "User not logged in"}), 401

    try:
        preferences = request.json.get('preferences', {})
        user_data = load_user_data(username)  # Load user data from the database or file
        if user_data:
            user_data['preferences'] = preferences  # Save the new preferences
            save_user_data(username, user_data)  # Save the user data back to storage
            return jsonify({"success": True}), 200
        return jsonify({"error": "User data not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/leaderboard')
def leaderboard():
    # Load all users' data
    users = load_users()
    
    # Get points for each user from the game_data
    leaderboard_data = []
    for username in users:
        user_data = load_user_data(username)
        points = user_data.get('game_data', {}).get('points', 0)  # Access points from game_data
        leaderboard_data.append({
            'username': username,
            'points': points
        })
    
    # Sort leaderboard by points in descending order
    leaderboard_data.sort(key=lambda x: x['points'], reverse=True)
    
    return render_template('leaderboard.html', leaderboard_data=leaderboard_data)

if __name__ == '__main__':
    app.run(port=80)
