from flask import Flask, render_template, request, redirect, url_for, session, jsonify
import os
import hashlib
import json

app = Flask(__name__)
app.secret_key = 'your_secret_key'

USERS_FILE = 'users/users.json'
os.makedirs('users', exist_ok=True)
os.makedirs('data', exist_ok=True)


# Utility Functions
def hash_password(password):
    """Hash a password using SHA256."""
    return hashlib.sha256(password.encode()).hexdigest()


def load_users():
    """Load all users from the users.json file."""
    if not os.path.exists(USERS_FILE):
        with open(USERS_FILE, 'w') as f:
            json.dump({}, f)
    with open(USERS_FILE, 'r') as f:
        return json.load(f)


def save_users(users):
    """Save all users to the users.json file."""
    with open(USERS_FILE, 'w') as f:
        json.dump(users, f, indent=4)


def load_user_data(username):
    """Load user game data from the data folder."""
    filepath = os.path.join('data', f'{username}.json')
    if os.path.exists(filepath):
        with open(filepath, 'r') as f:
            return json.load(f)
    return {
        'game_data': {
            'points': 0,
            'pointsPerClick': 1,
            'upgradeCost': 10,
            'autoClickerRate': 0,
            'prestigeLevel': 0,
            'boostActive': False
        },
        'preferences': {
            'darkMode': False
        }
    }


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
        username = request.form['username']
        password = request.form['password']
        users = load_users()

        if username in users and users[username]['password'] == hash_password(password):
            session['username'] = username
            return redirect(url_for('index'))
        return "Invalid username or password", 401

    return render_template('login.html')


@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        users = load_users()

        if username in users:
            return "Username already exists", 400

        users[username] = {'password': hash_password(password)}
        save_users(users)
        save_user_data(username, load_user_data(username))  # Initialize game data
        return redirect(url_for('login'))

    return render_template('signup.html')


@app.route('/save', methods=['POST'])
def save_game():
    username = session.get('username')
    if not username:
        return jsonify({"error": "User not logged in"}), 401

    try:
        data = request.json
        user_data = load_user_data(username)
        user_data['game_data'] = data.get('game_data', {})
        user_data['preferences'] = data.get('preferences', {})
        save_user_data(username, user_data)
        return jsonify({"success": True}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/load', methods=['GET'])
def load_game():
    username = session.get('username')
    if not username:
        return jsonify({"error": "User not logged in"}), 401

    user_data = load_user_data(username)
    return jsonify({
        'game_data': user_data.get('game_data', {}),
        'preferences': user_data.get('preferences', {})
    })


@app.route('/leaderboard')
def leaderboard():
    """Generate the leaderboard."""
    # Check if the user is logged in
    dark_mode = False  # Default to light theme
    if 'username' in session:
        # If logged in, load the user's preferences
        username = session['username']
        user_data = load_user_data(username)
        dark_mode = user_data.get('preferences', {}).get('darkMode', False)  # Read dark mode preference

    # Load all users' data
    users = load_users()
    leaderboard_data = [
        {
            'username': username,
            'points': load_user_data(username).get('game_data', {}).get('points', 0),
            'prestigeLevel': load_user_data(username).get('game_data', {}).get('prestigeLevel', 0),
            'autoClickerRate': load_user_data(username).get('game_data', {}).get('autoClickerRate', 0),
        }
        for username in users
    ]
    leaderboard_data.sort(key=lambda x: x['points'], reverse=True)
    
    # Pass the leaderboard data and dark mode preference to the template
    return render_template('leaderboard.html', leaderboard_data=leaderboard_data, dark_mode=dark_mode)

@app.route('/static-file-manifest')
def static_file_manifest():
    file_manifest = []
    for folder in ['css', 'js']:
        folder_path = os.path.join(app.static_folder, folder)
        for root, _, files in os.walk(folder_path):
            for file in files:
                relative_path = os.path.relpath(os.path.join(root, file), app.static_folder)
                # Corrected: Ensure that backslashes are replaced with forward slashes
                file_manifest.append(f'/static/{relative_path.replace(os.sep, "/")}')
    return jsonify(file_manifest)


# Run the app
if __name__ == '__main__':
    app.run(port=80)
