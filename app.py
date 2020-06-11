from flask import Flask

from routes import init_api_routes

app = Flask(__name__, template_folder='template')
init_api_routes(app)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
