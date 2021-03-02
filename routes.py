from main import get_ufirst_data, get_irb_data, get_enrollment_data, get_home, health

def init_api_routes(app):
    if app:
        app.add_url_rule('/', 'get_home', get_home, methods=['GET'])
        app.add_url_rule('/ufirst', 'get_ufirst_data', get_ufirst_data, methods=['GET'])
        app.add_url_rule('/irb', 'get_irb_data', get_irb_data, methods=['GET'])
        app.add_url_rule('/enrollment', 'get_enrollment_data', get_enrollment_data, methods=['GET'])
        app.add_url_rule('/health', 'health', health, methods=['GET'])
