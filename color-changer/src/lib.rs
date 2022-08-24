use rand::{thread_rng, Rng};
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
#[derive(Serialize, Deserialize)]
pub struct Theme {
    name: String,
    background: String,
    foreground: String,
    primary: String,
}

#[wasm_bindgen]
impl Theme {
    #[wasm_bindgen(constructor)]
    pub fn new(name: &str, background: &str, foreground: &str, primary: &str) -> Theme {
        Theme {
            name: name.to_string(),
            background: background.to_string(),
            foreground: foreground.to_string(),
            primary: primary.to_string(),
        }
    }
}

fn color_generate() -> Vec<Theme> {
    let warm: Theme = Theme::new("warm", "#B270A2", "#FF8FB1", "#FCE2DB");
    let cold: Theme = Theme::new("cold", "#AFB4FF", "#9C9EFE", "#A66CFF");
    vec![warm, cold]
}

#[wasm_bindgen]
pub fn color_changer(name: &str) -> JsValue {
    let theme_list = color_generate();
    let mut res = &theme_list[0];
    for theme in &theme_list {
        if name == theme.name {
            res = &theme;
        }
    }
    JsValue::from_serde(res).unwrap()
}

#[wasm_bindgen]
pub fn color_random() -> JsValue {
    let theme_list = color_generate();
    let mut rng = thread_rng();
    let index = rng.gen_range(0..theme_list.len());
    JsValue::from_serde(&theme_list[index]).unwrap()
}
