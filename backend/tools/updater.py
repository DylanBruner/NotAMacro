import requests, os, pyzipper, shutil

print("Fetching manifest")
manifest = requests.get('https://dylanbruner.github.io/NotAMacro/manifest.json').json()[-1]

os.makedirs('temp', exist_ok=True)

print("Downloading update")
with open('temp/update.7z', 'wb') as f:
    f.write(requests.get(f"https://dylanbruner.github.io/NotAMacro/release/{manifest['filename']}").content)

print("Extracting update")
with pyzipper.AESZipFile('temp/update.7z') as zf:
    zf.extractall(pwd='BDkhZ9jDZdOernS0gLqHowMatI030vUg'.encode('utf-8'))

print("Copying files")
shutil.rmtree('temp')

print("Done!")