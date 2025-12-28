import os
import subprocess
import time

def run_command(command):
    try:
        # Menjalankan command shell
        result = subprocess.run(command, check=True, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        print(f"Error running command: {command}")
        print(e.stderr)
        return None

def get_commit_details(file_path):
    """
    Menentukan Emoji dan Tipe Commit berdasarkan nama file/ekstensi.
    Format: <emoji> <type>
    """
    base = os.path.basename(file_path).lower()
    ext = os.path.splitext(file_path)[1].lower()
    
    # 1. 📝 docs
    if "readme" in base or ext == ".md" or "license" in base:
        return "📝 docs"
    
    # 2. 🔧 chore (Config, Tooling)
    if any(x in base for x in ["config", "package.json", "lock", "gitignore", "env", "docker", "ecosystem"]):
        return "🔧 chore"
    if ".github" in file_path or "scripts" in file_path:
        return "👷 ci" # Atau chore
        
    # 3. 🎨 style
    if ext in [".css", ".scss", ".sass", ".less", ".styl"]:
        return "🎨 style"
    
    # 4. ✅ test
    if "test" in base or "spec" in base or "verify" in base:
        return "✅ test"

    # 5. 🚀 feat (Source Code)
    # Default untuk file code source (ts, js, vue, html)
    if ext in [".ts", ".js", ".vue", ".html", ".php"]:
        # Bisa lebih spesifik jika mau, tapi 'feat' aman untuk inisial add
        return "🚀 feat"
    
    # 6. 🖼️ assets (Images, static) -> Masuk chore atau feat? 
    # Kita anggap chore untuk asset static atau feat
    if ext in [".png", ".jpg", ".jpeg", ".svg", ".ico", ".json"]:
        return "🎨 style" # Atau chore

    # Default
    return "🔧 chore"

def main():
    print("🤖 AI Git Automation: Starting process...")
    
    # 1. Detect Untracked/Modified Files
    # Menggunakan git status --porcelain -uall untuk list SEMUA file individual (termasuk isi folder untracked)
    status_output = run_command("git status --porcelain -uall")
    
    if not status_output:
        print("✅ No changes detected. Working tree clean.")
        return

    # Parsing output git status
    # Format: "XY Path/To/File" -> kita ambil Path nya
    files = []
    for line in status_output.split('\n'):
        # Hapus quotes jika ada (jika filename ada spasi)
        raw_path = line[3:].strip()
        if raw_path.startswith('"') and raw_path.endswith('"'):
            raw_path = raw_path[1:-1]
        files.append(raw_path)

    total_files = len(files)
    print(f"📦 Detected {total_files} files to process.")

    count = 0
    batch_size = 50 # Push setiap 50 commit agar efisien
    
    for file_path in files:
        count += 1
        
        # 2. Git Add (Individual)
        run_command(f'git add "{file_path}"')
        
        # 3. Git Commit (Individual with Standard Message)
        type_emoji = get_commit_details(file_path)
        filename = os.path.basename(file_path)
        
        # Format: <emoji> <type>: add <filename>
        # Example: 🚀 feat: add validation.ts
        commit_message = f"{type_emoji}: add {filename}"
        
        print(f"[{count}/{total_files}] Committing: {commit_message}")
        res = run_command(f'git commit -m "{commit_message}"')
        
        if res is None:
            print(f"⚠️ Failed to commit {file_path}. Skipping.")
            continue

        # Batch Push
        if count % batch_size == 0:
            print(f"🔄 Executing Batch Push ({count} files)...")
            run_command("git push origin main")

    # Final Push
    print("🚀 executing Validating Final Push...")
    run_command("git push origin main")
    print("✅ All tasks completed successfully!")

if __name__ == "__main__":
    main()
