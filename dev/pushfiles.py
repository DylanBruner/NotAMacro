import shutil

DEV_DIR = 'NotAMacro'
GAME_DIR = 'C:\\Users\\brune\\AppData\\Roaming\\PrismLauncher\\instances\\HypixelSkyblock\\.minecraft\\config\\ChatTriggers\\modules\\NotAMacro'

print('Deleting old files...')
shutil.rmtree(GAME_DIR)
print('Copying new files...')
shutil.copytree(DEV_DIR, GAME_DIR)
print('Done!')