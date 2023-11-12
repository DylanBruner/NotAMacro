import os, json, subprocess, zipfile, shutil, pyzipper

# CONFIG =================================
ENCRYPTION_PASSWORD = "password"

OUTPUT_PATH = "docs/release"
INPUT_PATHS = ["data", "helpers", "macros", "index.js", "metadata.json"]
MANIFEST_PATH = "docs/manifest.json"

SEVENZIP_PATH = os.path.abspath("7zr.exe")
TEMP_PATH = "temp"

# ========================================

if os.path.exists(TEMP_PATH):
    shutil.rmtree(TEMP_PATH)
os.makedirs(TEMP_PATH)

with open('metadata.json', 'r') as f:
    metadata = json.load(f)

print(f"Generating release for {metadata['name']} v{metadata['version']}")
# copy the folders into the temp folder
for path in INPUT_PATHS:
    if os.path.isdir(path):
        shutil.copytree(path, os.path.join(TEMP_PATH, path))
    else:
        shutil.copy(path, os.path.join(TEMP_PATH, path))

print("Creating zip file")
# subprocess.run([SEVENZIP_PATH, "a", "-mhe", "-p" + ENCRYPTION_PASSWORD, os.path.join(OUTPUT_PATH, f"{metadata['name']}-v{metadata['version']}.7z"), os.path.join(TEMP_PATH, "*")])
with pyzipper.AESZipFile(os.path.join(OUTPUT_PATH, f"{metadata['name']}-v{metadata['version']}.7z"), 'w', compression=pyzipper.ZIP_LZMA, encryption=pyzipper.WZ_AES) as zf:
    zf.setpassword(ENCRYPTION_PASSWORD.encode('utf-8'))
    for root, dirs, files in os.walk(TEMP_PATH):
        for file in files:
            zf.write(os.path.join(root, file), os.path.relpath(os.path.join(root, file), TEMP_PATH))


shutil.rmtree(TEMP_PATH)

print("Updating manifest")
with open(MANIFEST_PATH, 'r') as f:
    manifest = json.load(f)

manifest.append({
    "version": metadata['version'],
    "filename": f"{metadata['name']}-v{metadata['version']}.7z"
})

# remove duplicates
manifest = [dict(t) for t in {tuple(d.items()) for d in manifest}]
manifest.sort(key=lambda x: x['version'], reverse=True)

with open(MANIFEST_PATH, 'w') as f:
    json.dump(manifest, f)