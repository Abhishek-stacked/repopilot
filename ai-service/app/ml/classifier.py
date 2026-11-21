import os

def classify_code_entity(file_path: str, content: str = "") -> str:
    """
    Classifies a file or code block into semantic architecture roles.
    """
    path_lower = file_path.lower()
    content_lower = content.lower()

    if any(k in path_lower for k in ['.test.', '.spec.', '__tests__', '/tests/']):
        return 'test'
    if any(k in path_lower for k in ['auth', 'jwt', 'session', 'oauth', 'passport']):
        return 'auth_security'
    if any(k in path_lower for k in ['controller', 'router', 'routes', 'endpoint', 'api/']):
        return 'api_route'
    if any(k in path_lower for k in ['model', 'schema', 'entity', 'types']):
        return 'data_model'
    if any(k in path_lower for k in ['middleware', 'interceptor', 'guard']):
        return 'middleware'
    if any(k in path_lower for k in ['db', 'database', 'migration', 'seeds', 'sql']):
        return 'database'
    if any(k in path_lower for k in ['component', 'page', 'view', '.jsx', '.tsx', '.vue']):
        return 'ui_component'
    if any(k in path_lower for k in ['util', 'helper', 'lib', 'service', 'tools']):
        return 'utility'
    if any(k in path_lower for k in ['config', 'settings', '.env', 'dockerfile']):
        return 'configuration'

    return 'core_logic'
