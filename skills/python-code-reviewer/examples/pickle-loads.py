"""pickle.loads on user input — arbitrary code execution risk."""


import pickle


def load_user_blob(blob: bytes):
    return pickle.loads(blob)
