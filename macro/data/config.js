import {
    @ButtonProperty,
    @CheckboxProperty,
    Color,
    @ColorProperty,
    @PercentSliderProperty,
    @SelectorProperty,
    @SwitchProperty,
    @TextProperty,
    @Vigilant,
    @SliderProperty,
    createPropertyAttributesExt,
} from '../../Vigilance/index';
import Core from "../helpers/core";
import Consts from "../data/shared";

@Vigilant("NotAMacro", "§5NotAMacro §zv" + Consts.version, {
    getCategoryComparator: () => (a, b) => {
        l = ["General", "General Macro Config", "Fail-Safes", "Cane", "Mushroom", "Cactus", "Cocoa", "Pumpkin/Melon", "A/D Macro", "Island Forager", "Warp Back"];
        return l.indexOf(a.name) - l.indexOf(b.name);
    }
})
class Config {
    constructor() {
        Core.init(this);
        this.registerProperty.bind(this);
        this.registerTemplate.bind(this);
    }
    
    registerProperty(type, configKey, _default, config) {
        this.__config_props__[configKey] = createPropertyAttributesExt(type, config);
        this[configKey] = _default;
    }

    registerTemplate(cfg){
        Object.keys(cfg).forEach((key) => {
            this.registerProperty(cfg[key].type, key, cfg[key].default, cfg[key].config);
        });
    }
    
    init(){
        this.initialize(this);
        this.setCategoryDescription("General", "")
    }

    // General config ==========================================
    @ButtonProperty({
        name: "Reload Macros",
        category: "General",
        description: "Reloads the macros (some settings wont take effect until you do this)",
        placeholder: "Reload"
    })
    reloadMacros() {
        ChatLib.chat("§7[§cNotAMacro§7] §aYou shouldn't see this message, please report this to the developer!");
    }

    @SelectorProperty({
        name: "Selected Macro",
        category: "General",
        options: ["Mushroom", "Cane", "AD Macro", "Island Forager", "Warp Back", "Cactus", "Cocoa", "Pumpkin/Melon", "Fishing Helper"],
    })
    SelectedMacro = 0;

    // config for all the macros ===============================
    @SwitchProperty({
        name: "Quick Death",
        description: "Detects void drops and runs /warp garden",
        category: "General Macro Config",
        subcategory: "Farming"
    })
    GeneralMacroConfigQuickDeath = true;

    @SliderProperty({
        name: "Quick Death Distance",
        description: "The distance to check for void drops",
        category: "General Macro Config",
        subcategory: "Farming",
        min: 1,
        max: 10
    })
    GeneralMacroConfigQuickDeathDistance = 5;
}

export default new Config();