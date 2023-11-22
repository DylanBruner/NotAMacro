import shutil, os

DEV_DIR = 'NotAMacro'
GAME_DIR = 'C:\\Users\\brune\\AppData\\Roaming\\PrismLauncher\\instances\\HypixelSkyblock\\.minecraft\\config\\ChatTriggers\\modules\\NotAMacro'

print('Deleting old files...')
try:
    shutil.rmtree(GAME_DIR)
except FileNotFoundError:
    pass
print('Copying new files...')
shutil.copytree(DEV_DIR, GAME_DIR, ignore=shutil.ignore_patterns('config.toml'))
# copy all files except .toml files
# for file in os.listdir(DEV_DIR):
#     if file.endswith('.toml'):
#         continue
#     shutil.copy(os.path.join(DEV_DIR, file), GAME_DIR)
print('Done!')