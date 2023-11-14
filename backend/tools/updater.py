import requests, os, pyzipper, shutil, sys, traceback

PREFIX = "&7[§cNotAMacro&7/&aUpdater&7]&r "

def getLatestVersion(manifest: dict) -> str:
    versions = [x['version'] for x in manifest]
    versionNum = versions[versions.index(max(versions))]

    for x in manifest:
        if x['version'] == versionNum:
            return x

try:
    MODULE_FOLDER = sys.argv[1]

    print(f"{PREFIX}&aChecking for updates...")
    manifest = requests.get('https://dylanbruner.github.io/NotAMacro/manifest.json').json()
    latest = getLatestVersion(manifest)
    print(f"{PREFIX}&aLatest version: &c{latest['version']}&a")

    os.makedirs(f'{MODULE_FOLDER}/temp', exist_ok=True)

    print(f"{PREFIX}&cDownloading update...")
    with open(f'{MODULE_FOLDER}/temp/update.7z', 'wb') as f:
        f.write(requests.get(f"https://dylanbruner.github.io/NotAMacro/release/{latest['filename']}").content)

    print(f"{PREFIX}&cExtracting update...")
    with pyzipper.AESZipFile(f'{MODULE_FOLDER}/temp/update.7z') as zf:
        old = os.getcwd()
        os.chdir(f'{MODULE_FOLDER}')
        zf.extractall(pwd='BDkhZ9jDZdOernS0gLqHowMatI030vUg'.encode('utf-8'), members=[x for x in zf.namelist() if not x.startswith('tools/')])
        os.chdir(old)

    print(f"{PREFIX}&cCleaning up...")
    shutil.rmtree(f'{MODULE_FOLDER}/temp')

    print(f"{PREFIX}&aUpdate complete!")
except Exception as e:
    print(f"{PREFIX}&cAn error occured while updating!")
    traceback.print_exc()