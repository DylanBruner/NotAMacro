import os, json, shutil, pyzipper

# CONFIG =================================
ENCRYPTION_PASSWORD = "BDkhZ9jDZdOernS0gLqHowMatI030vUg"

META_PATH = "NotAMacro/metadata.json"

OUTPUT_PATH = "docs/release"
INPUT_PATHS = ["NotAMacro/data", "NotAMacro/helpers", "NotAMacro/macros", "NotAMacro/tools", "NotAMacro/index.js", META_PATH]
MANIFEST_PATH = "docs/manifest.json"

TEMP_PATH = "temp"

# ========================================

changelog = ""
print("Enter changelog (exit to exit):")
while (line := input("Line> ")).strip() != "exit":
    changelog += line + "\n"

if os.path.exists(TEMP_PATH):
    shutil.rmtree(TEMP_PATH)
os.makedirs(TEMP_PATH)

with open(META_PATH, 'r') as f:
    metadata = json.load(f)

print(f"Generating release for {metadata['name']} v{metadata['version']}")
# copy the folders into the temp folder
for path in INPUT_PATHS:
    if os.path.isdir(path):
        shutil.copytree(path, os.path.join(TEMP_PATH, path))
    else:
        shutil.copy(path, os.path.join(TEMP_PATH, path))

with pyzipper.AESZipFile(os.path.join(OUTPUT_PATH, f"{metadata['name']}-v{metadata['version']}.7z"), 'w', compression=pyzipper.ZIP_LZMA, encryption=pyzipper.WZ_AES) as zf:
    zf.setpassword(ENCRYPTION_PASSWORD.encode('utf-8'))
    for root, dirs, files in os.walk(TEMP_PATH):
        for file in files:
            zf.write(os.path.join(root, file), os.path.relpath(os.path.join(root, file), os.path.join(TEMP_PATH, 'NotAMacro')))
        
    # modify the metadata.json within the zipfile to set debug to false
    # print("Setting debug to false...", end="")
    # data = zf.read('metadata.json')
    # metadata = json.loads(data.decode('utf-8'))
    # metadata['debug'] = False
    # data = json.dumps(metadata).encode('utf-8')
    # zf.writestr('metadata.json', data)
    # print("Done!")


shutil.rmtree(TEMP_PATH)

print("Updating manifest")
with open(MANIFEST_PATH, 'r') as f:
    manifest = json.load(f)

manifest.append({
    "version": metadata['version'],
    "filename": f"{metadata['name']}-v{metadata['version']}.7z",
    "changelog": changelog
})

# remove duplicates
manifest = [dict(t) for t in {tuple(d.items()) for d in manifest}]
manifest.sort(key=lambda x: x['version'], reverse=True)

with open(MANIFEST_PATH, 'w') as f:
    json.dump(manifest, f)

print("Done!")