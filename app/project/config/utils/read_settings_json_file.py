from json import load as json_load

def read_settings_json_file(file_path: str):
    with open(file_path, "r") as f:
        json_data = json_load(f)
        return json_data