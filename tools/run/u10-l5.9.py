defaults = {"port": 8000, "debug": False, "host": "localhost"}
file_cfg = {"port": 5000}
cli_cfg = {"debug": True}
final = defaults | file_cfg | cli_cfg
print(final)
