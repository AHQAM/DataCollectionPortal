import subprocess

subprocess.run(["git", "add", "."], check=True)
subprocess.run(["git", "commit", "-m", "fix(ci): fix typecheck and ESM module issues for tests"], check=True)
subprocess.run(["git", "push"], check=True)
