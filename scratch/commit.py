import subprocess

subprocess.run(["git", "add", "."], check=True)
subprocess.run(["git", "commit", "-m", "fix: resolve firebase dependencies and prettier formatting issues"], check=True)
subprocess.run(["git", "push"], check=True)
