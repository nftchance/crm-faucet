DEBUG = True

ALLOWED_HOSTS = ["*", "host.docker.internal"]

INTERNAL_IPS = [
    "127.0.0.1",
    "host.docker.internal",
]

DEBUG_TOOLBAR_CONFIG = {
    "SHOW_TOOLBAR_CALLBACK": lambda request: True,
}