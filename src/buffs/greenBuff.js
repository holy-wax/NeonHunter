export function getTimeBonus(buffs) {
    return buffs.filter(b => b.id === 'time_lv1').length * 5;
}
export function getPriceBonus(buffs, color) {
    let bonus = 0;
    if (color === 'blue') bonus += buffs.filter(b => b.id === 'blue_lv1').length * 20;
    if (color === 'pink') bonus += buffs.filter(b => b.id === 'pink_lv1').length * 20;
    return bonus;
}
export function getComboBonus(buffs) {
    return buffs.filter(b => b.id === 'combo_lv1').length * 0.1;
}
export function getFreqBonus(buffs) {
    return buffs.filter(b => b.id === 'freq_lv1').length * 0.1;
}
export function getSpeedBonus(buffs) {
    return buffs.filter(b => b.id === 'speed_lv1').length * 1.0;
}

export function getYellowChanceOverride(buffs) {
    return buffs.some(b => b.id === 'locust_lv1') ? 0.25 : 0;
}