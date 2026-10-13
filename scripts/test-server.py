"""Static-only test server: validates a GitHub Pages project subpath."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

root = Path(__file__).resolve().parent.parent / 'dist'

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(root), **kwargs)

    def do_GET(self):
        if not self.path.startswith('/programming-languages/'):
            self.send_error(404)
            return
        self.path = self.path.removeprefix('/programming-languages')
        super().do_GET()

ThreadingHTTPServer(('127.0.0.1',8002),Handler).serve_forever()
