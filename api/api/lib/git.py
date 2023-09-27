import subprocess
import pkg_resources

def get_git_revision_hash() -> str:
    return subprocess.check_output(['git', 'rev-parse', 'HEAD']).decode('utf-8').strip()

def get_version() -> str:
    return pkg_resources.get_distribution('api').version

