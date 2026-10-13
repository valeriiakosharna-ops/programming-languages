"""Local educational runner. Run: python3 server.py. Never expose publicly."""
import json
import os
from pathlib import Path
import resource
import shutil
import subprocess
import tempfile
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = Path(__file__).resolve().parent

def limits():
    resource.setrlimit(resource.RLIMIT_CPU, (4, 4))
    resource.setrlimit(resource.RLIMIT_FSIZE, (1024 * 1024, 1024 * 1024))
    resource.setrlimit(resource.RLIMIT_NOFILE, (128, 128))

def execute(language, code):
    if language not in ('python', 'javascript', 'java'):
        raise ValueError('Невідома мова')
    if not isinstance(code, str) or len(code.encode()) > 20000:
        raise ValueError('Код має бути коротшим за 20 КБ')
    with tempfile.TemporaryDirectory(prefix='nix-code-') as folder:
        paths = {'python': ('main.py', ['python3', '-I', 'main.py']),
                 'javascript': ('main.js', ['node', '--max-old-space-size=96', 'main.js']),
                 'java': ('Main.java', ['java', '-Xmx96m', '-XX:ActiveProcessorCount=2', 'Main.java'])}
        filename, command = paths[language]
        if not shutil.which(command[0]):
            raise ValueError('Потрібно встановити ' + command[0])
        Path(folder, filename).write_text(code, encoding='utf-8')
        # Output goes to bounded files rather than unbounded PIPE buffers.
        with open(Path(folder, 'out'), 'w+') as out, open(Path(folder, 'err'), 'w+') as err:
            process = subprocess.Popen(command, cwd=folder, stdin=subprocess.DEVNULL,
                                       stdout=out, stderr=err, start_new_session=True,
                                       preexec_fn=limits)
            timed_out = False
            try:
                process.wait(timeout=8)
            except subprocess.TimeoutExpired:
                timed_out = True
            finally:
                import signal
                try:
                    os.killpg(process.pid, signal.SIGKILL)
                except ProcessLookupError:
                    pass
                process.wait()
            out.seek(0)
            err.seek(0)
            return {'stdout': out.read(12000), 'stderr': 'Час виконання вичерпано. Перевір цикл.' if timed_out else err.read(12000), 'ok': process.returncode == 0 and not timed_out}

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_POST(self):
        if self.path != '/api/run':
            self.send_error(404)
            return
        if self.headers.get('Origin') and self.headers['Origin'] != 'http://' + self.headers.get('Host', ''):
            self.send_error(403)
            return
        try:
            length = int(self.headers.get('Content-Length', '0'))
            if length < 1 or length > 24000:
                raise ValueError('Завеликий запит')
            data = json.loads(self.rfile.read(length))
            result = execute(data.get('language'), data.get('code'))
            status = 200
        except (ValueError, TypeError, OSError) as exc:
            result, status = {'ok': False, 'stderr': str(exc), 'stdout': ''}, 400
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.end_headers()
        self.wfile.write(json.dumps(result).encode())

if __name__ == '__main__':
    print('Тренажер: http://127.0.0.1:8000', flush=True)
    ThreadingHTTPServer(('127.0.0.1', 8000), Handler).serve_forever()
