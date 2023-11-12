import requests, os, pyzipper, shutil, sys

MODULE_FOLDER = sys.argv[1]

print("Fetching manifest")
manifest = requests.get('https://dylanbruner.github.io/NotAMacro/manifest.json').json()[-1]

os.makedirs('temp', exist_ok=True)

print("Downloading update")
with open(f'{MODULE_FOLDER}/temp/update.7z', 'wb') as f:
    f.write(requests.get(f"https://dylanbruner.github.io/NotAMacro/release/{manifest['filename']}").content)

print("Extracting update")
with pyzipper.AESZipFile(f'{MODULE_FOLDER}/temp/update.7z') as zf:
    old = os.getcwd()
    os.chdir(f'{MODULE_FOLDER}')
    zf.extractall(pwd='BDkhZ9jDZdOernS0gLqHowMatI030vUg'.encode('utf-8'))
    os.chdir(old)

print("Copying files")
shutil.rmtree(f'{MODULE_FOLDER}/temp')

print("Done!")