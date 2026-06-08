"""
Good counterpart of pickle-loads.py.
"""


import json


def load_user_blob(blob: bytes):
    # Fix 1 (no pickle): switch to JSON at the API boundary. `pickle.loads`
    # executes arbitrary code on deserialisation, so an attacker who
    # controls the blob can run any command on the server. If a
    # richer format is needed, switch to msgpack/protobuf with a
    # schema validator.
    return json.loads(blob)
