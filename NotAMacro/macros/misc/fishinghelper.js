import Macro from "../macro";
import Config from "../../data/Config";
import Safety from "../../helpers/safety";
import Utils from "../../helpers/utils";
import MovementLib from "../../helpers/movementlib";
import Recordings from "../../data/recordings";

const robot = Java.type("java.awt.Robot");
const InputEvent = Java.type("java.awt.event.InputEvent");
const PropertyType = Java.type("gg.essential.vigilance.data.PropertyType");
const MouseInfo = Java.type("java.awt.MouseInfo");

export default class FishingHelper extends Macro {
    static macroName = "Fishing Helper";

    constructor(scope) {
        super();

        this.scope = scope

        this.macroName = "Fishing Helper";
        this.macroID = 8;
        this.plingcd = 0;
        this.failcd = 0;
        this.enabled = true;
        this.nextWiggleTime = -1;
        this.bobberCastTime = -1;

        this.startMouseLocation = MouseInfo.getPointerInfo().getLocation();

        this.originalSlot = -1;
        this.calls = 0;

        this.myRobot = new robot();

        this.hook();
    }

    static getConfig(){
        return {
            FishingHelperAutoKill: {
                type: PropertyType.SWITCH,
                default: false,
                config: {
                    name: "Auto Kill",
                    description: "Automatically kill the Lava Flame",
                    category: "Fishing Helper"
                }
            },
            FishingHelperKillItem: {
                type: PropertyType.TEXT,
                default: "Hyperion",
                config: {
                    name: "Kill Item",
                    description: "The item to use to kill the Lava Flame",
                    category: "Fishing Helper"
                }
            },
            FishingHelperClicks: {
                type: PropertyType.SLIDER,
                default: 6,
                config: {
                    name: "Clicks",
                    description: "How many times to click",
                    category: "Fishing Helper",
                    min: 1,
                    max: 10
                }
            },
            FishingHelperAutoWiggle: {
                type: PropertyType.SWITCH,
                default: false,
                config: {
                    name: "Auto Wiggle",
                    description: "Automatically wiggle the camera to bypass the anti-macro system",
                    category: "Fishing Helper"
                }
            },
            FishingHelperReelDelay: {
                type: PropertyType.SLIDER,
                default: 0,
                config: {
                    name: "Reel Delay",
                    description: "Delay between reeling in the fish (for slugfish basiclly, 0 to disable)",
                    category: "Fishing Helper",
                    min: 0,
                    max: 60
                }
            },
        }
    }

    recast() {
        this.myRobot.mousePress(InputEvent.BUTTON3_DOWN_MASK);
        setTimeout(() => {
            this.myRobot.mouseRelease(InputEvent.BUTTON3_DOWN_MASK);
            this.bobberCastTime = Date.now();
        }, 25); // 25-100ms
    }

    tap_right() {
        if (this.calls > 10) {ChatLib.chat("§cToo many calls!"); return;}
        this.calls++;
        ChatLib.chat("§aTap right");
        
        this.myRobot.mousePress(InputEvent.BUTTON3_DOWN_MASK);
        setTimeout(() => {
            this.myRobot.mouseRelease(InputEvent.BUTTON3_DOWN_MASK);
        }, 25); // 25-100ms
    }

    click_n_times_with_random_delay(n) {
        this.tap_right();
        setTimeout(() => {
            if (n > 1) {
                this.click_n_times_with_random_delay(n - 1);
            } else {
                this.calls = 0;
                setTimeout(() => {
                    Safety.setSlot(this.originalSlot);
                    setTimeout(() => {
                        this.recast();
                    }, Math.floor(Math.random() * 100) + 100); // 100-200ms
                }, Math.floor(Math.random() * 100) + 100); // 100-200ms
            }
        }, Math.floor(Math.random() * 100) + 50); // 25-125ms
    }

    actualrecast() {
        setTimeout(() => {
            this.myRobot.mousePress(InputEvent.BUTTON3_DOWN_MASK);
            setTimeout(() => {
                this.myRobot.mouseRelease(InputEvent.BUTTON3_DOWN_MASK);
                setTimeout(() => {
                    this.recast();
                }, Math.floor(Math.random() * 100) + 100); // 100-200ms
            }, Math.floor(Math.random() * 100) + 25); // 25-125ms
        }, Math.floor(Math.random() * 100) + 25); // 25-125ms
    }

    hook() {
        this.soundHook = register("soundPlay", (position, method, vol, pitch, category, event) => {
            if (!this.enabled) return;
            if (method.includes("note.pling") && Date.now() - this.plingcd > 500 && pitch == 1) {
                // if the bobber was cast less than config.FishingHelperReelDelay seconds ago, don't recast
                if (Date.now() - this.bobberCastTime < Config.FishingHelperReelDelay * 1000) {
                    ChatLib.chat(`§cReel delay is ${Config.FishingHelperReelDelay} (` + Utils.formatTime(Config.FishingHelperReelDelay * 1000 - (Date.now() - this.bobberCastTime)) + ` left)`);
                    return;
                }

                this.plingcd = Date.now();
                this.actualrecast();

            } else if (method.includes('random.successful_hit') && pitch == 0.7936508059501648 && Date.now() - this.failcd > 500) {
                this.failcd = Date.now();
                this.actualrecast();
            }
                // if (!method.includes('fire.fire') && !method.includes('mob.') && !method.includes('.player'))
                //     ChatLib.chat(`${method} ${vol} ${pitch}`)
                // game.neutral.swim 1 0.4920634925365448 (4) << golden fish
            }
        );

        this.chathook = register('chat', (event) => {
            if (!this.enabled) return;

            const message = ChatLib.getChatMessage(event);
            if (message.removeFormatting().includes('A Lava Flame flies out from beneath the lava.') && Config.FishingHelperAutoKill){
                setTimeout(() => {
                    this.originalSlot = Player.getHeldItemIndex();
                    let found = false;
                    for (let i = 0; i < 9; i++){
                        const item = Player.getInventory().getStackInSlot(i);
                        if (item != null && item.getName().removeFormatting().includes(Config.FishingHelperKillItem)){
                            Safety.setSlot(i);
                            found = true;
                            break;
                        }
                    }

                    if (!found) {
                        ChatLib.chat(`§cCould not find ${Config.FishingHelperKillItem}!`);
                        return;
                    }

                    setTimeout(() => {
                        // click right click 5 times with a random delay between 50-100ms using setTimeout
                        this.click_n_times_with_random_delay(Config.FishingHelperClicks);
                    }, 50 + Math.floor(Math.random() * 50)); // 50-100ms
                }, 425 + Math.floor(Math.random() * 200)); // initial delay to 'notice' the Lava Flame (600-800ms)
            }
        })
    }

    on_pause() {
        this.enabled = false;
        this.scope.mlib.stop();
    }

    on_start() {
        this.on_resume();
    }

    on_resume() {
        this.enabled = true;
        this.bobberCastTime = Date.now();
        this.nextWiggleTime = Date.now() + Math.floor(Math.random() * 15000) + 40000; // 40-55s
        this.hook();
    }

    tick() {
        if (this.scope.mlib.isPlaying()) {
            if (Player.getHeldItem() == null || !Player.getHeldItem().getName().includes('Rod')) {
                ChatLib.chat("§cNot holding a rod!");
                this.scope.mlib.stop();
                return;
            }
            if (this.startMouseLocation != null && this.startMouseLocation.distance(MouseInfo.getPointerInfo().getLocation()) > 1) {
                ChatLib.chat("§cMouse moved!");
                this.scope.mlib.stop();
                return;
            }
        }

        if (this.nextWiggleTime == -1 || Date.now() > this.nextWiggleTime){
            this.nextWiggleTime = Date.now() + Math.floor(Math.random() * 15000) + 40000; // 40-55s
            if (!Config.FishingHelperAutoWiggle) return;
            if (Player.getHeldItem() == null || !Player.getHeldItem().getName().includes('Rod')) {
                ChatLib.chat("§cNot holding a rod!");
                return;
            }

            // this.scope.mlib.playRecording(Recordings.FISHING_HELPER_WIGGLES[Math.floor(Math.random() * Recordings.FISHING_HELPER_WIGGLES.length)], true);
            const wiggle = Recordings.FISHING_HELPER_WIGGLE[Math.floor(Math.random() * Recordings.FISHING_HELPER_WIGGLE.length)];
            this.scope.mlib.playRecording(wiggle, true);
            this.startMouseLocation = MouseInfo.getPointerInfo().getLocation();
        }
    }
}